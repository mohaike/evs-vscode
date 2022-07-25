import { posix } from 'path';
import {
	Disposable,
	TextEditor,
	window,
    workspace,
    Uri,
    Range,
    TextEditorRevealType,
    Selection,
    commands,
} from 'vscode';


export default class DocumentWatcher {
	private disposable: Disposable;
    private splitStr: string = "[d0747b6a1bc6f5027a1c3d75f734dce21c0f205b15d54f6681e935a9298579a697264126d69ffb96]";
    private emacsHome: string = '' + workspace.getConfiguration().get('evs.emacsConfigHome');

	public constructor()
    {
        const subscriptions: Disposable[] = [];

        this.momoStupid();
        //this.readPosition(window.activeTextEditor, "yahaha");

		subscriptions.push(
            // 修复飞速切换时跳转的Bug
			window.onDidChangeActiveTextEditor(async editor => {
                //this.readPosition(editor, "0000");
			}),
		);

		subscriptions.push(
			window.onDidChangeWindowState(async state => {
                if (!state.focused) { return; }
                //this.readPosition(window.activeTextEditor, "0001");
            }),
		);

		subscriptions.push(
			window.onDidChangeTextEditorSelection(e => {
                //this.readPosition(window.activeTextEditor, "0002");
			}),
		);

		subscriptions.push(
			workspace.onDidChangeConfiguration(e => {
                //this.readPosition(window.activeTextEditor, "0003");
			}),
		);

		subscriptions.push(
			workspace.onDidOpenTextDocument(e => {
                //this.readPosition(window.activeTextEditor, "0004");
            }),
		);

		subscriptions.push(
			workspace.onDidChangeTextDocument(e => {
                //this.readPosition(window.activeTextEditor, "0005");
			}),
		);

		this.disposable = Disposable.from.apply(this, subscriptions);
	}

    public dispose() {
		this.disposable.dispose();
	}

    private async momoStupid()
    {
        const sleep = (milliseconds:number) => {
            return new Promise(resolve => setTimeout(resolve, milliseconds));
        }

        while (true)
        {
            await sleep(200); // wait 0.2 seconds

            // 已经是单线程了，好处就是这个全然是自己控制的，不必跟系统的事件打架
            // 简单明了，而且效率会高很多
            // 虽然还是有卡的时候，不过这个已经能看出来，是读文件读卡了
            // console.log('momoStupid');

            const evsGoDirUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
            const evsGoDataUri = evsGoDirUri.with({ path: posix.join(evsGoDirUri.path, 'vs_code_go') });
            var goTime = (await workspace.fs.stat(evsGoDataUri)).mtime;

            const evsStopDirUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
            const evsStopDataUri = evsStopDirUri.with({ path: posix.join(evsStopDirUri.path, 'vs_code_stop') });
            var stopTime = (await workspace.fs.stat(evsStopDataUri)).mtime;
            var currentTime = new Date().getTime();

            const checkTime = 1000; // 检测时间
            var isGoUpdate = (+goTime) > (+stopTime);
            var canGo = (+currentTime) - (+goTime) < checkTime;
            var isInCheckTime = isGoUpdate && canGo;

            if(!isInCheckTime) {continue;}


            // 获取文件的上参数(这个文件应该默认存在)
            const evsValueDirUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
            const evsDataUri = evsValueDirUri.with({ path: posix.join(evsValueDirUri.path, 'vscode_get_value') });
            // 最后修改时间，根据这个来判断后面是否需要清理
            var mTimeIndexZero = (await workspace.fs.stat(evsDataUri)).mtime;

            var evsData = await workspace.fs.readFile(evsDataUri);
            var evsDataStringTmp = Buffer.from(evsData).toString('utf8');
            var evsDataString = evsDataStringTmp.replace(/\r|\n/ig,"");

            console.log('[momo fix]---------------start---------------');
            // 在合理范围内刷新数
            while (evsDataString === '' && isInCheckTime)
            {
                currentTime = new Date().getTime();
                goTime = (await workspace.fs.stat(evsGoDataUri)).mtime;
                stopTime = (await workspace.fs.stat(evsStopDataUri)).mtime;
                isGoUpdate = (+goTime) > (+stopTime);
                canGo = (+currentTime) - (+goTime) < checkTime;
                isInCheckTime = isGoUpdate && canGo;

                console.log('[momo fix] while');

                // 那就刷到不为空为止
                mTimeIndexZero = (await workspace.fs.stat(evsDataUri)).mtime;
                evsData = await workspace.fs.readFile(evsDataUri);
                evsDataStringTmp = Buffer.from(evsData).toString('utf8');
                evsDataString = evsDataStringTmp.replace(/\r|\n/ig,"");
            }
            const sbTime01 = (+ currentTime - goTime)/1000;
            console.log('[momo fix]---------------get-data-time--------------sbTime01:', sbTime01);

            // 假如是空数据，并且超时，那么什么都不做
            if (evsDataString === '' && !isInCheckTime) { continue; }

            // 第一个是位置，为-1代表是路径，第二个是文件路径
            let evsDataArray = evsDataString.split(this.splitStr);
            const evsPosition = evsDataArray[0];
            const evsFilePath = evsDataArray[1];
            // 有需要跳转的位置
            if (+evsPosition < 0) { continue; }

            const editor = window.activeTextEditor;
            if (editor === undefined || !editor.document)
            {
                // 编辑器卡死，更新时间
                var goUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
                var goUriFile = goUri.with({ path: posix.join(goUri.path, 'vs_code_go') });
                await workspace.fs.writeFile(goUriFile, Buffer.from('', 'utf8'));
                continue;
            }

            // 当前（多线程）的编辑器的文件路径是什么
            // 飞快切的时候，VSCode内部会反应不过来，editor
            const filePath = editor.document.uri.fsPath;
            console.log('[momo fix] evsFilePath: ', evsFilePath);
            console.log('[momo fix] filePath: ', filePath);

            // 不是对应的文件，什么都不做
            if (evsFilePath !== filePath) { continue; }

            // 跳转位置
            const index = clamp(+evsPosition - 1, 0);
            let target = editor.document.positionAt(index);
            target = editor.document.validatePosition(target);
            editor.revealRange(new Range(target, target), TextEditorRevealType.InCenter);
            editor.selection = new Selection(target, target);

            const mTimeIndexEnd = (await workspace.fs.stat(evsDataUri)).mtime;
            if (mTimeIndexZero === mTimeIndexEnd)
            {
                // 说明是同一个文件，可以将其清空
                // mLog(callID, 'momo clean file 10086');
                var goUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
                var goUriFile = goUri.with({ path: posix.join(goUri.path, 'vscode_get_value') });
                await workspace.fs.writeFile(goUriFile, Buffer.from('', 'utf8'));

                var goUriFile = goUri.with({ path: posix.join(goUri.path, 'vs_code_stop') });
                await workspace.fs.writeFile(goUriFile, Buffer.from('', 'utf8'));
                console.log('[momo fix]---------------stop---------------');
            }

        }
    }

    // 读取文件位置信息
    private async readPosition(editor?: TextEditor, other?: any)
    {
        // return;
        const callID = '['+other+']';

        mLog(callID, "momo readPosition 001");
        // 获取文件的上参数(这个文件应该默认存在)
        const evsValueDirUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
        const evsDataUri = evsValueDirUri.with({ path: posix.join(evsValueDirUri.path, 'vscode_get_value') });
        // 最后修改时间，根据这个来判断后面是否需要清理
        var mTimeIndexZero = (await workspace.fs.stat(evsDataUri)).mtime;

        const evsGoDirUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
        const evsGoDataUri = evsGoDirUri.with({ path: posix.join(evsGoDirUri.path, 'vs_code_go') });
        var goTime = (await workspace.fs.stat(evsGoDataUri)).mtime;

        const evsStopDirUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
        const evsStopDataUri = evsStopDirUri.with({ path: posix.join(evsStopDirUri.path, 'vs_code_stop') });
        var stopTime = (await workspace.fs.stat(evsStopDataUri)).mtime;

        // 当前时间
        var currentTime = new Date().getTime();

        console.log('goTime', goTime);
        console.log('stopTime', stopTime);
        console.log('curreny time:', currentTime);


        const checkTime = 1000; // 检测时间

        // 运行的时间比要求暂停的时间要大，说明是在运行
        var sbTime = (+ goTime - stopTime)/1000;
        var sbTime01 = (+ currentTime - goTime)/1000;

        console.log('sbTime', sbTime);
        console.log('sbTime01', sbTime01);


        // 的确需要检测，假如当前的时间和运行的时间比较起来，在检测的范围内的话
        // 那就说明可以跳转
        var isInCheckTime = sbTime > 0 && sbTime01 < checkTime;

        // 不需跳转
        if(!isInCheckTime) return;

        // 需要跳转
        var evsData = await workspace.fs.readFile(evsDataUri);
        var evsDataStringTmp = Buffer.from(evsData).toString('utf8');
        var evsDataString = evsDataStringTmp.replace(/\r|\n/ig,"");

        console.log('[momo fix]---------------start---------------');
        // 在合理范围内刷新数
        while (evsDataString === '' && isInCheckTime)
        {
            // 针对一个时间切片里面的go命令做检测？？？
            // 可以不用管go的时间？？先不管
            // goTime = (await workspace.fs.stat(evsGoDataUri)).mtime;
            // 是否在可检测的时间内然后做刷新
            currentTime = new Date().getTime();
            // 实时检测是否需要停下，因为有的
            stopTime = (await workspace.fs.stat(evsStopDataUri)).mtime;
            sbTime = (+ goTime - stopTime)/1000;
            sbTime01 = (+ currentTime - goTime)/1000;

            isInCheckTime = sbTime > 0 && sbTime01 < checkTime;

            console.log('[momo fix] while', 'sbTime', sbTime, 'sbTime01', sbTime01);

            // 那就刷到不为空为止
            mTimeIndexZero = (await workspace.fs.stat(evsDataUri)).mtime;
            evsData = await workspace.fs.readFile(evsDataUri);
            evsDataStringTmp = Buffer.from(evsData).toString('utf8');
            evsDataString = evsDataStringTmp.replace(/\r|\n/ig,"");
        }
        console.log('[momo fix]---------------get-data-time--------------sbTime01:', sbTime01);

        // 假如是空数据，并且超时，那么什么都不做
        if (evsDataString === '' && !isInCheckTime) { return; }

        // 第一个是位置，为-1代表是路径，第二个是文件路径
        let evsDataArray = evsDataString.split(this.splitStr);
        const evsPosition = evsDataArray[0];
        const evsFilePath = evsDataArray[1];
        // 有需要跳转的位置
        if (+evsPosition < 0) { return; }

        if (editor === undefined || !editor.document)
        {
            // 说明编辑器卡死了，动一下鼠标
            commands.executeCommand("cursorMove", { to: "right", by:'character', value: 1 });
            commands.executeCommand("cursorMove", { to: "left", by:'character', value: 1 });

            // 顺便更新一下时间
            var goUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
            var goUriFile = goUri.with({ path: posix.join(goUri.path, 'vs_code_go') });
            await workspace.fs.writeFile(goUriFile, Buffer.from('', 'utf8'));
            return;
        }

        // 当前（多线程）的编辑器的文件路径是什么
        // 飞快切的时候，VSCode内部会反应不过来，editor
        const filePath = editor.document.uri.fsPath;
        mLog(callID, 'momo evsFilePath: ', evsFilePath);
        mLog(callID, 'momo filePath: ', filePath);

        // 不是对应的文件，什么都不做
        if (evsFilePath !== filePath) { return; }

        // 跳转位置
        const index = clamp(+evsPosition - 1, 0);
        let target = editor.document.positionAt(index);
        target = editor.document.validatePosition(target);
        editor.revealRange(new Range(target, target), TextEditorRevealType.InCenter);
        editor.selection = new Selection(target, target);

        const mTimeIndexEnd = (await workspace.fs.stat(evsDataUri)).mtime;
        if (mTimeIndexZero === mTimeIndexEnd)
        {
            // 说明是同一个文件，可以将其清空
            // mLog(callID, 'momo clean file 10086');
            var goUri = Uri.file(this.emacsHome + "/taotao-plugin-settings/evs/evs-vscode/__tmp");
            var goUriFile = goUri.with({ path: posix.join(goUri.path, 'vscode_get_value') });
            await workspace.fs.writeFile(goUriFile, Buffer.from('', 'utf8'));

            var goUriFile = goUri.with({ path: posix.join(goUri.path, 'vs_code_stop') });
            await workspace.fs.writeFile(goUriFile, Buffer.from('', 'utf8'));
            console.log('[momo fix]---------------stop---------------');
        }
        else
        {
            // 这里是一个进程走的程序，前后获取到的时间戳不一样
            // 异步数据，不清理文件，会被其他进程用到
            mLog(callID, 'momo DOOOOOOOOOO NOOOOOOOOT CLEAN 10086');
        }
    }

}

function mLog(id: string, msg: any, msg2?: any)
{
    console.log(id, msg, msg2);
}

function clamp(val: any, min: any, max = Infinity) {
    if (val < min) { return min; }
    if (val > max) { return max; }
    return val;
}
