/* ------------------------------
    IMPORTS AND DEFINITIONS
------------------------------ */

const fs = require('fs');
const commandLineArgs = require('command-line-args');
const cheerio = require('cheerio');
const yaml = require('js-yaml');
const showdown  = require('showdown');
const showdownHighlight = require("showdown-highlight");
showdown.setOption('tables', true);
showdown.setOption('tasklists', true);
showdown.setOption('strikethrough', true);
showdown.setOption('simpleLineBreaks', true);
showdown.setFlavor('github');

const codeCSS = fs.readFileSync('./css/atom-one-dark.min.css', 'utf8');
const baseCSS = fs.readFileSync('./css/cnp.css', 'utf8');

// Find in ./presets all files that end with .yml, use as available presets for PresetOptions
const ymlPresets = fs.readdirSync('./presets').filter(file => file.endsWith('.yml'));
const acceptedPresets = ymlPresets.map(file => file.split('.').slice(0, -1).join('.'));

/**
 * @typedef {Object} FileDetails
 */
class FileDetails {
    /**
     * @property {string} filename - Path to the file, relative or absolute
     * @property {boolean} exists - Does the file exist? --> handling non-existent files
     * @property {boolean} correctType - Is the file of the correct type? --> handling incorrect file types
     * @param {string} filename - Path to the file, relative or absolute
     * @param {string} extension - The file extension to check for, without the dot
     */

    constructor (filename, extension) {
        this.filename = filename;
        this.exists = fs.existsSync(filename);

        // only allow the file to be of a certain extension
        if (extension) {
            const fileExtension = filename.split('.').pop();
            if (fileExtension === extension) {
                this.correctType = true;
            } else {
                this.correctType = false;
            }
        } else {
            this.correctType = true;
        }
    }
}

/**
 * @typedef {Object} PresetOptions
 */
class PresetOptions {
    /**
     * @property {string} name - The preset name
     * @property {boolean} exists - Does the preset exist?
     * @param {string} preset - The preset name
     */

    // return exists boolean for the preset
    constructor (preset = 'default') {
        this.name = preset;

        if (acceptedPresets.includes(preset)) {
            this.exists = true;
        } else {
            this.exists = false;
        }
    }
}

const optionDefinitions = [
    { name: 'input', alias: 'i', type: filename => new FileDetails(filename, "md"), multiple: true, defaultOption: true },
    { name: 'preset', alias: 'p', type: preset => new PresetOptions(preset), defaultValue: new PresetOptions("default") },
    { name: 'classmap', alias: 'c', type: filename => new FileDetails(filename, "json") },
]
const options = commandLineArgs(optionDefinitions);


function applyCustomClasses(html, classMap) {
    const $ = cheerio.load(html);

    // Iterate over the classMap and apply classes to matching subtags
    Object.keys(classMap).forEach(selector => {
        const className = classMap[selector];
        const selectors = selector.split(' ');

        let $element = $.root();
        selectors.forEach(selector => {
            $element = $element.find(selector);
        });

        $element.addClass(className);
    });

    return $.html();
}

const loadPreset = (presetName) => {
    try {
        const preset = yaml.load(fs.readFileSync(`./presets/${presetName}.yml`, 'utf8'));
        console.log("Using preset: ", `${presetName}.yml`);
        return preset;
    } catch (e) {
        throw e;
    }
};


/* ------------------------------
    APPLICATION
------------------------------ */

console.clear();
console.log();

// // VALIDATIONS

if (!options.input || options.input.length === 0) {
    console.log('No source files specified. Exiting.');
    process.exit();
}

// Any source files that don't exist? --> exit
const nonExistentFiles = options.input.filter(file => !file.exists);
if (nonExistentFiles.length > 0) {
    console.log(`The following files do not exist: ${nonExistentFiles.map(file => file.filename).join(', ')}`);
    process.exit();
}
delete nonExistentFiles;


// Any source files that are not of the correct type? --> exit
const incorrectTypeFiles = options.input.filter(file => !file.correctType);
if (incorrectTypeFiles.length > 0) {
    console.log(`The following files are not of the correct type: ${incorrectTypeFiles.map(file => file.filename).join(', ')}`);
    console.log(`Only markdown files are allowed.`);
    process.exit();
}
delete incorrectTypeFiles;

// Any presets that don't exist? --> exit
if (!options.preset.exists) {
    console.log(`The preset "${options.preset.name}" does not exist.`);
    console.log(`Presets currently available:\n\t- ${acceptedPresets.join('\n\t- ')}`);
    process.exit();
}

// If classmap is specified, does it exist or correct type? --> if not, notify and switch to default
if (options.classmap) {
    if (!options.classmap.exists) {
        console.log(`The classmap file "${options.classmap.filename}" does not exist.`);
        console.log(`Switching to default classmap.`);
        options.classmap = null;
    } else if (!options.classmap.correctType) {
        console.log(`The classmap file "${options.classmap.filename}" is not of the correct type.\nFile must be JSON.`);
        console.log(`Switching to default classmap.`);
        options.classmap = null;
    }
}


// APPLICATION
const presetFile = loadPreset(options.preset.name);

let classMap = presetFile.class_map_dir ? JSON.parse(fs.readFileSync(presetFile.class_map_dir, 'utf8')) : {};

// Use the classMap argument if it exists --> override the preset
if (options.classmap) {
    console.log('\x1b[33m%s\x1b[0m',"Override preset with class map: ", options.classmap.filename);
    classMap = JSON.parse(fs.readFileSync(options.classmap.filename, 'utf8'));
}

// Load HTML base template
let htmlBase;
if (!presetFile.html_base || !fs.existsSync(presetFile.html_base)) {
    console.log('\x1b[33m%s\x1b[0m',"No HTML base template found. Using default.");
    htmlBase = '';
}
else {
    htmlBase = fs.readFileSync(presetFile.html_base, 'utf8') || '';
}

if (htmlBase.indexOf('<body>') === -1) {
    htmlBase = `<body>{{BODY}}</body>${htmlBase}`;
}
if (htmlBase.indexOf('<head>') === -1) {
    htmlBase = `<head></head>${htmlBase}`;
}

const converter = new showdown.Converter({
    extensions: [
        showdownHighlight({
            pre: true,
            auto_detection: true
        }),
    ]
});

// Read the files and convert to HTML
console.log();
options.input.forEach(file => {
    const dateTime = new Date().toISOString().replace(/T/, ', ').replace(/\..+/, '');
    const dateTimeComment = `<!-- Generated on ${dateTime} -->\n`;

    let template = `${dateTimeComment}${htmlBase}`
    const text = fs.readFileSync(file.filename, 'utf8');
    let html = converter.makeHtml(text);
    html = template.replace('{{BODY}}', html);

    // Add CSS in <style> tag at the top of <head>
    let css = `<style>${baseCSS}</style><style>${codeCSS}</style>`;

    // Add font:
    const font = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=K2D:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet"></link>
    `;

    // Add CSS to <head> by replace </head> tag
    html = html.replace('</head>', `${font}${css}</head>`);

    // Update the title, description, image, and url with the preset values
    // {{TITLE}}, {{DESCRIPTION}}, {{IMAGE}}, {{URL}}
    html = html.replaceAll('{{TITLE}}', presetFile.TITLE || "Untitled");
    html = html.replaceAll('{{DESCRIPTION}}', presetFile.DESCRIPTION || "No description.");
    html = html.replaceAll('{{IMAGE}}', presetFile.IMAGE || "");
    html = html.replaceAll('{{URL}}', presetFile.URL || "");

    // Add the HTML to the base template
    
    html = applyCustomClasses(html, classMap);

    // Write to file
    const outputFilename = file.filename.split('.').slice(0, -1).join('.') + '.html';
    fs.writeFileSync(outputFilename, html);
    console.log(`Wrote ${outputFilename}`);
});

console.log("Done!");

console.log();