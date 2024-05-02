// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let workspacePath : string | undefined;
var assetList: string[] = [];
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "flutter-simple-asset-generator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('flutter-simple-asset-generator.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from flutter simple asset generator!');
	});
	let onRightClickFolder = vscode.commands.registerCommand("flutter-simple-asset-generator.readFolder", (uri: vscode.Uri) => {
		fs.stat(uri.fsPath, (err, stats) => {
			if(err) {
				console.log("error", err.message);
				vscode.window.showErrorMessage('Error reading folder');
				return;
			}
			console.log("checking stat of path", stats.isDirectory().toString());
			if(!stats.isDirectory()) {
				vscode.window.showErrorMessage("This is not a Folder");
				return;
			} else {
				if(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
					workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
					console.log(workspacePath);
				}
				if(!workspacePath || workspacePath!.length == 0) return;
				processFolder(uri.fsPath);
			}
			
		});
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(onRightClickFolder);
}
async function processFolder(filePath: string) {
    try {
        assetList = [];
		await readFolderContents(filePath);
		console.log("asset list", assetList);
		if(assetList.length == 0) return;
		editPubFolder(assetList);
    } catch (error) {
        console.error('Failed to process folder:', error);
    }
}


function readFolderContents(folderPath: string): Promise<void> {
    if (!workspacePath) return Promise.resolve();
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, { withFileTypes: true }, async (err, files) => {
            if (err) {
                console.log("error", err.message);
                vscode.window.showErrorMessage('Error reading folder');
                reject(err);
                return;
            }

            for (const file of files) {
                if (file.isDirectory()) {
                    console.log('Directory:', file.name);
                    await readFolderContents(path.join(folderPath, file.name));
                } else {
                    console.log('File:', file.name);
                    assetList.push(path.join(file.path, file.name).replace(workspacePath! + "\\", ""));
                }
            }
            resolve();
        });
    });
}

function editPubFolder(assetList: String[]) {
	for(const assetPath of assetList) {
		console.log('generate path:', assetPath);
	}
	// const workspaceFolders = vscode.workspace.workspaceFolders;
    // if (!workspaceFolders || workspaceFolders.length === 0) {
    //     vscode.window.showWarningMessage('No workspace is opened.');
    //     return;
    // }
}

// This method is called when your extension is deactivated
export function deactivate() {}
