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

let cmds = ["git stash clear"];

function executeCmd(cmd, repo){
    return child_process.execSync(cmd, {cwd: path.resolve(repo)});
}

function runUpdateOnRepo(repo){
    let i=0;
    console.log("Starting to clear stash...", repo);
    while(i<cmds.length){
        let cmd = cmds[i];
        try{
            let result = executeCmd(cmd, repo);
            result = result.toString();
            if(result != ""){
                manualUpdateRepos.push(repo);
            }
        }catch(err){
            //ignoring for now!!!
        }
        i++
    }
    let final = executeCmd("git stash list", repo);
    final = final.toString();
    if(final != ""){
        manualUpdateRepos.push(repo);
    }
    console.log("Finalized clearning stash of repo", repo);
}


console.log("Start scanning directory", path.resolve(startingDir), "to identify GIT Repos...\n\n");
discoveryGitRepos([startingDir]);
console.info("Scanning for stashes in next repos:", gitRepos, "\n");

console.info("Clearing stashes...");
while(gitRepos.length>0){
	process.stdout.write("%");
    let repo = gitRepos.pop();
    runUpdateOnRepo(repo);
}
process.stdout.write("\n");

console.log('\033[2J');
let len = manualUpdateRepos.length;
if(len > 0){
    console.info("Next repo"+(len > 1 ? "s" : "")+" had some issues when clearning stash:");
    for(let j=0; j<len; j++){
        console.info("\t", ">", manualUpdateRepos[j]);
    }
}else{
    console.info("Task finished. All good!");
}