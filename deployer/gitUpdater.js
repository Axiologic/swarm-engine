const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

let startingDir = "./../";

const argv = process.argv;
argv.shift();
argv.shift();
if(argv.length>0){
    startingDir = argv[0];
}

let gitRepos = [];
let manualUpdateRepos = [];

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}

function discoveryGitRepos(directoryArr){
    while(directoryArr.length>0){
        let dir = path.resolve(directoryArr.pop());
        let subDirs = getDirectories(dir);
        let foundGit = false;
        for(var i=0; i<subDirs.length; i++){
            let sd = subDirs[i];
            if(sd.indexOf(".git")!=-1){
                if(path.join(dir, sd).indexOf(path.join("privatesky",".git"))==-1){
                    gitRepos.push(dir);
                }else{
                    manualUpdateRepos.push(dir);
                    console.log("Ignoring main project", dir);
                    console.log("Is better to handle manualy!");
                }
            }else{
                directoryArr.push(path.join(dir, sd));
            }
        }
    }
}

let cmds = ["git stash", "git pull", "git stash apply"];

function executeCmd(cmd, repo){
    return child_process.execSync(cmd, {cwd: path.resolve(repo)});
}

function runUpdateOnRepo(repo){
    let i=0;
    console.log("Start updating repo", repo);
    while(i<cmds.length){
        let cmd = cmds[i];
        try{
            let result = executeCmd(cmd, repo);
            result = result.toString();
        }catch(err){
            //ignoring for now!!!
        }
        i++
    }
    let final = executeCmd("git status", repo);
    final = final.toString();
    if(final.indexOf("Unmerged")!=-1){
        manualUpdateRepos.push(repo);
    }
    console.log("Finalized updating repo", repo);
}



console.log("Start scanning directory", path.resolve(startingDir), "to identify GIT Repos...\n\n");
discoveryGitRepos([startingDir]);
console.log("Found repos:", gitRepos, "\n");



while(gitRepos.length>0){
    let repo = gitRepos.pop();
    runUpdateOnRepo(repo);
}

console.log('\033[2J');
let len = manualUpdateRepos.length;
if(len > 0){
    console.log("Verify and update next repo"+(len > 1 ? "s" : "")+":");
    for(let j=0; j<len; j++){
        console.log("\t", ">", manualUpdateRepos[j]);
    }
}else{
    console.log("Update done. All good!");
}