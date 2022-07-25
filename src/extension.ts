import * as vscode from 'vscode';
import { posix } from 'path';
import MoMoStupid from './MoMoStupid';

export function activate(context: vscode.ExtensionContext) {
    const momoStupid =  new MoMoStupid();
    context.subscriptions.push(momoStupid);
    const emacsHome = ''+vscode.workspace.getConfiguration().get('evs.emacsConfigHome');
    const splitStr = "[d0747b6a1bc6f5027a1c3d75f734dce21c0f205b15d54f6681e935a9298579a697264126d69ffb96]";
    const valueHome = "/taotao-plugin-settings/evs/evs-vscode/__tmp";

    // 主动触发，跳转至emacs，用emacs打开文件夹
    let callEmacsDire = vscode.commands.registerCommand('evs.emacs.callDire', async () => {
        // 监听函数
        if(momoStupid)
        {
            momoStupid.wakeUp();
        }
        else
        {
            console.log('[momoStupid] is been killed');
        }

        // Emacs打开文件夹
        openEmacsDir();

        // Emacs打开文件夹
        async function openEmacsDir()
        {
            if (vscode.workspace.workspaceFolders !== undefined)
            {
                let workspaceFolderPath = vscode.workspace.workspaceFolders[0].uri.path;
                // 将当前的值写入文本传递给Emacs
                const writeStr = 'emacs_char_index=' + '\"isdir\"' + '\n' +
                                 'current_filePath=\"' + workspaceFolderPath + '\"';
                const writeData = Buffer.from(writeStr, 'utf8');
                const evsValueDirUri = vscode.Uri.file(emacsHome + "/taotao-plugin-settings/evs/evs-emacs/__tmp");
                const evsValueFileUri = evsValueDirUri.with({ path: posix.join(evsValueDirUri.path, 'v') });
                await vscode.workspace.fs.writeFile(evsValueFileUri, writeData);

                // 执行Shell脚本，这个Shell脚本可以开启emacs，用emacs打开对应的文件的对应的位置
                const cp = require('child_process');
                const evsEmacs = 'sh ' + emacsHome + '/taotao-plugin-settings/evs/evs-emacs/go.sh';
                cp.exec(evsEmacs, (err:any, stdout:any, stderr:any) => {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (err) {
                        console.log('error: ' + err);
                    }
                });
            }
        }
    });
    context.subscriptions.push(callEmacsDire);

    // 主动触发，跳转至emacs，打开文件或者文件夹
    let disposable = vscode.commands.registerCommand('evs.emacs', async () => {

        // 监听函数
        if(momoStupid)
        {
            momoStupid.wakeUp();
        }
        else
        {
            console.log('[momoStupid] is been killed');
        }

        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor)
        {
            // Emacs打开文件
            openEmacsFile(activeEditor);
        }
        else
        {
            // Emacs打开文件夹
            openEmacsDir();
        }

        // Emacs打开文件
        async function openEmacsFile(editor:vscode.TextEditor)
        {
            if (editor !== undefined && editor.document)
            {
                // 跳转前保存
                vscode.commands.executeCommand('workbench.action.files.save');
                // 将当前的值写入文本传递给Emacs
                const currentCharPosition = editor.document.offsetAt(editor.selection.active) + 1;
                let emacsCharIndex = clamp(+currentCharPosition, 0);
                const currentFilePath = vscode.window.activeTextEditor?.document.fileName;
                const writeStr = 'emacs_char_index=' + emacsCharIndex + '\n' +
                                'current_filePath=\"' + currentFilePath + '\"';
                const writeData = Buffer.from(writeStr, 'utf8');
                const evsValueDirUri = vscode.Uri.file(emacsHome + "/taotao-plugin-settings/evs/evs-emacs/__tmp");

                // const wsedit = new vscode.WorkspaceEdit();
                // wsedit.createFile(evsValueDirUri, { ignoreIfExists: true });
                // vscode.workspace.applyEdit(wsedit);
                const evsValueFileUri = evsValueDirUri.with({ path: posix.join(evsValueDirUri.path, 'v') });
                await vscode.workspace.fs.writeFile(evsValueFileUri, writeData);
                return;
                // 执行Shell脚本，这个Shell脚本可以开启emacs，用emacs打开对应的文件的对应的位置
                const cp = require('child_process');
                const evsEmacs = 'sh ' + emacsHome + '/taotao-plugin-settings/evs/evs-emacs/go.sh';
                cp.exec(evsEmacs, (err:any, stdout:any, stderr:any) => {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (err) {
                        console.log('error: ' + err);
                    }
                });
            }
        }

        // Emacs打开文件夹
        async function openEmacsDir()
        {
            if (vscode.workspace.workspaceFolders !== undefined)
            {
                let workspaceFolderPath = vscode.workspace.workspaceFolders[0].uri.path ;
                // 将当前的值写入文本传递给Emacs
                const writeStr = 'emacs_char_index=' + '\"isdir\"' + '\n' +
                                 'current_filePath=\"' + workspaceFolderPath + '\"';
                const writeData = Buffer.from(writeStr, 'utf8');
                const evsValueDirUri = vscode.Uri.file(emacsHome + "/taotao-plugin-settings/evs/evs-emacs/__tmp");
                const evsValueFileUri = evsValueDirUri.with({ path: posix.join(evsValueDirUri.path, 'v') });
                await vscode.workspace.fs.writeFile(evsValueFileUri, writeData);

                // 执行Shell脚本，这个Shell脚本可以开启emacs，用emacs打开对应的文件的对应的位置
                const cp = require('child_process');
                const evsEmacs = 'sh ' + emacsHome + '/taotao-plugin-settings/evs/evs-emacs/go.sh';
                cp.exec(evsEmacs, (err:any, stdout:any, stderr:any) => {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (err) {
                        console.log('error: ' + err);
                    }
                });
            }
        }
    });
    context.subscriptions.push(disposable);

    // 主动触发，跳转至emacs，用emacs打开文件夹
    let readPositionCmd = vscode.commands.registerCommand('evs.emacs.readPosition', async () => {

        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) { readPosition(activeEditor); }

        // 读取文件位置信息
        async function readPosition(editor:vscode.TextEditor)
        {
            const path = emacsHome + valueHome;
            const dataFile = getFileUri(path, 'vscode_get_value');

            console.log("momo readPosition Out 001");
            const evsDataString = getDataString(await vscode.workspace.fs.readFile(dataFile));
            if (evsDataString === '') { return; }

            console.log("momo readPosition Out 002");
            // 第一个是位置，为-1代表是路径，第二个是文件路径
            let evsDataArray = evsDataString.split(splitStr);
            const evsPosition = +evsDataString.split(splitStr)[0] - 1; // 光标位置
            const evsFilePath = ''+evsDataString.split(splitStr)[1];   // 文件路径
            if (evsPosition < 0) { return; }

            console.log("momo readPosition Out 003 evsPosition:", evsPosition);
            if (editor !== undefined && editor.document)
            {
                // 当前（多线程）的编辑器的文件路径是什么
                // 飞快切的时候，VSCode内部会反应不过来，editor
                const filePath = editor.document.uri.fsPath;
                console.log('momo evsFilePath out: ', evsFilePath);
                console.log('momo filePath out: ', filePath);
                if (evsFilePath !== filePath) { return; }

                console.log("momo readPosition Out 004");

                // 可跳转，就将位置信息清空，下次就不会再跳
                await vscode.workspace.fs.writeFile(dataFile, Buffer.from('', 'utf8'));

                // 只要有是EVS指定打开的文件才可以，跳转位置
                let target = editor.document.positionAt(clamp(evsPosition, 0));
                target = editor.document.validatePosition(target);
                // 跳转位置
                editor.revealRange(new vscode.Range(target, target), vscode.TextEditorRevealType.InCenter);
                editor.selection = new vscode.Selection(target, target);
            }

        }
    });
    context.subscriptions.push(readPositionCmd);


}

// this method is called when your extension is deactivated
export function deactivate() {}

function getDataString(data:Uint8Array):string
{
    return Buffer.from(data).toString('utf8').replace(/\r|\n/ig,"");
}

function getFileUri(fileDir:string, fileName:string):vscode.Uri
{
    const dir = vscode.Uri.file(fileDir);
    const file = dir.with({ path: posix.join(dir.path, fileName) });
    return file;
}


function clamp(val: any, min: any, max = Infinity) {
    if (val < min) { return min; }
    if (val > max) { return max; }
    return val;
}
