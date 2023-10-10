# https://stackoverflow.com/questions/55860925/git-skip-worktree-on-all-tracked-files-inside-directory-and-its-subdirectories

# run with 
# $ bash untrack-presets.sh

!#/bin/bash
cd presets

find . -maxdepth 1 -type d \( ! -name . \) -exec bash -c "cd '{}' && pwd && git ls-files -z ${pwd} | xargs -0 git update-index --skip-worktree" \;
find . -maxdepth 1 -type f -exec git update-index --skip-worktree {} \;