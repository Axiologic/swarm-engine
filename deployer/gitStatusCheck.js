const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

const show_log = false;

const initialLog = console.log;
console.log = function(...args){
    if(show_log){
        initialLog(...args);
    }
}

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
            if(sd.indexOf(".git") != -1){
                gitRepos.push(dir);
            }else{
                directoryArr.push(path.join(dir, sd));
            }
        }
    }
}

let cmds = ["git status"];

function executeCmd(cmd, repo){
    return child_process.execSync(cmd, {cwd: path.resolve(repo)});
}

function runUpdateOnRepo(repo){
    let i=0;
    console.log("Start checking repo", repo);
    while(i<cmds.length){
        let cmd = cmds[i];
        try{
            let result = executeCmd(cmd, repo);
            result = result.toString();
            if(result.indexOf("nothing to commit") == -1){
                manualUpdateRepos.push(repo);
            }
        }catch(err){
            //ignoring for now!!!
        }
        i++
    }
    /*let final = executeCmd("git status", repo);
    final = final.toString();
    if(final.indexOf("Unmerged")!=-1){
        manualUpdateRepos.push(repo);
    }*/
    console.log("Finalized checking repo", repo);
}


console.log("Start scanning directory", path.resolve(startingDir), "to identify GIT Repos...\n\n");
discoveryGitRepos([startingDir]);
console.info("Scanning for status next repos:", gitRepos, "\n");


while(gitRepos.length>0){
    let repo = gitRepos.pop();
    runUpdateOnRepo(repo);
}

console.log('\033[2J');
let len = manualUpdateRepos.length;
if(len > 0){
    console.info("Next repo"+(len > 1 ? "s" : "")+" have changes:");
    for(let j=0; j<len; j++){
        console.info("\t", ">", manualUpdateRepos[j]);
    }
}else{
    console.info("No changes. All good!");
}