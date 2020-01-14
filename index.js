#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

async function searchDir(initialDir) {
  let arr = [];
  return new Promise((resolve, reject) => {
    function recursive(dir) {
      try {
        // read folder
        let files = fs.readdirSync(dir);

        // check files array
        if (files) {
          // iterate through all files
          for (let file of files) {
            let currentPath = path.resolve(dir, file);

            // check if the current repo is a git folder
            if (
              file !== "node_modules" &&
              fs.lstatSync(currentPath).isDirectory() &&
              file === ".git"
            ) {
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write(`-> ${dir}`);

              // git config file
              let gitConfig = path.join(currentPath, "config");

              // read config
              let data = fs.readFileSync(gitConfig, "utf8");

              // check if "find" is included
              if (findRegExp.test(data)) {
                fs.writeFileSync(
                  gitConfig,
                  data.replace(findRegExp, "$1" + replace)
                );

                arr.push(dir);
              }
            } else {
              recursive(currentPath);
            }
          }
        }

        return arr;
      } catch (e) {}
    }

    return resolve(recursive(initialDir));
  });
}

const [
  fullPath,
  find = "appcom-interactive",
  replace = "nanogiants"
] = process.argv.slice(2);

// regexp to replace current organization
const findRegExp = new RegExp("(/|:)" + find, "g");

if (!fullPath && !find && !replace) {
  process.stdout.write(`
Please enter a file path.
Example: node index.js <path> <find> <replace>
`);
} else {
  process.stdout.write(
    `\nSearch in ${fullPath} and replace ${find} with ${replace}\n`
  );

  searchDir(fullPath).then(data => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    if (data.length > 0) {
      process.stdout.write(`\nUpdated ${data.length} repos\n\n`);

      for (let p of data) {
        process.stdout.write(p + "\n");
      }
    } else {
      process.stdout.write(`\nWhoop whoop!! Everything is fine.`);
    }
  });
}
