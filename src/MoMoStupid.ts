import { posix } from 'path';
import {
    Disposable,
	window,
    workspace,
    Uri,
    Range,
    TextEditorRevealType,
    Selection,
    commands,
    TextEditor,
    WindowState,
} from 'vscode';

// 已知的问题，JS会自动释放内存，所以，有时候的while里的代码不会执到

export default class MoMoStupid {
    private disposable: Disposable | undefined;
    private splitStr: string = "[d0747b6a1bc6f5027a1c3d75f734dce21c0f205b15d54f6681e935a9298579a697264126d69ffb96]";
    private emacsHome: string = '' + workspace.getConfiguration().get('evs.emacsConfigHome');
    private valueHome: string = "/taotao-plugin-settings/evs/evs-vscode/__tmp";

    public breathVarP: number = 0;
    public breathVarM: number = 0;
    private breathNumber: number = 200; // 刷新频率
    private liveTime: number = 60*1000; // 激活监听的时间，默认是一个分钟
    private jumpAvailableTime: number = 10*1000; // 跳转后的有效时间

    private selectFilePath: string = "";    // 选中的文件路径
    private selectFilePosition: number = 0; // 选中文件位置信息
    private jumpTime: number = 0;   // 最后的跳转时间(可以理解为evs的行为时间)
    private selectTime: number = 0; // 发生选中的时间（可以理解为用户的行为时间）
    private cmdID: string = "";          // 执行的命令的ID，来自于Clojure的灵感

    private isInit: Boolean = false;


    // 缓存的信息
    private evsIDBuffer: string = "";
    private evsPathBuffer: string = "";
    private evsPositionBuffer: number = 0;


	public constructor() { this.init(); }
    public dispose() { this.disposable?.dispose(); }

    private init()
    {
        this.initValue();
        this.register();
        this.wakeUp();
        this.momoWatch();
    }

    private momoNow(): number { return new Date().getTime(); }

    private updateSelectTime() { this.selectTime = this.momoNow(); }

    // 记录命令已经被执行
    private evsCmdDone(agrID: string)
    {
        this.cmdID = agrID; // 记录刚刚被执行过命令ID
        this.jumpTime = this.momoNow();
        console.log('momo command done:', this.cmdID);
    }

    private initValue()
    {
        this.isInit = true;
        const now = this.momoNow();
        this.breathVarP = now;
        this.breathVarM = now;
        this.jumpTime = now;
    }

    public wakeUp()
    {
        // this.positionManager();
        this.momoStupid();
    }

    private isEVSAtcionArrive(): Boolean
    {
        // 就是跳转了，然后selection了
        return this.selectTime > this.jumpTime;
    }

    private isUserGo(goTime: number): Boolean
    {
        // 说明是可以执的d指令
        return goTime > this.selectTime && goTime > this.jumpTime;
    }

    // 在跳转保护时间里面
    private isInJumpAvailableTime(): Boolean
    {
        return this.momoNow() - this.jumpTime < this.jumpAvailableTime;
    }

    // 当前数据是否和evs数据匹配
    private isEqualWithEVSData(evsData:string): Boolean
    {
        const evsPath = ''+evsData.split(this.splitStr)[1];   // 文件路径
        const evsPosition = +evsData.split(this.splitStr)[0] - 1; // 光标位置
        return evsPath === this.selectFilePath && evsPosition === this.selectFilePosition;
    }


    // 注册事件
    private async register()
    {
        const subscriptions: Disposable[] = [];
		subscriptions.push(window.onDidChangeActiveTextEditor(async e => { this.handleDidChangeActiveTextEditor(); }));
		subscriptions.push(window.onDidChangeWindowState(async e => { this.handleDidChangeWindowState(e); }));

		subscriptions.push(window.onDidChangeTextEditorSelection(async e => { this.handleDidChangeTextEditorSelection(); }));
		subscriptions.push(workspace.onDidChangeConfiguration(async e => { this.handleDidChangeConfiguration(); }));
		subscriptions.push(workspace.onDidOpenTextDocument(async e => { this.handleDidOpenTextDocument(); }));
		subscriptions.push(workspace.onDidChangeTextDocument(async e => { this.handleDidChangeTextDocument(); }));
		this.disposable = Disposable.from.apply(this, subscriptions);
    }
	private async handleDidChangeActiveTextEditor() {
        console.log('---handleDidChangeActiveTextEditor');
        this.handleCallback(); }
	private async handleDidChangeWindowState(e:WindowState | undefined) {
        console.log('---handleDidChangeWindowState');
        this.handleCallback(); }
	private async handleDidChangeTextEditorSelection() {
        console.log('---handleDidChangeTextEditorSelection');
        this.handleCallback(); }
	private async handleDidChangeConfiguration() {
        console.log('---handleDidChangeConfiguration');
        this.handleCallback(); }
	private async handleDidOpenTextDocument() {
        console.log('---handleDidOpenTextDocument');
        this.handleCallback(); }
	private async handleDidChangeTextDocument() {
        console.log('---handleDidChangeTextDocument');
        this.handleCallback(); }


    // 位置收集器：负责查收集当前光标的位置
    private async handleCallback()
    {
        this.momoInitGo();
        this.positionCollector();
        //this.positionManager();
        this.momoStupid();
        this.momoWatch();
    }

    private async positionCollector()
    {
        const editor = window.activeTextEditor;
        if (editor === undefined || !editor.document) { return; }

        this.updateSelectFileData(editor);
    }
    private tellMoMoCheckNow(yesOrNo: Boolean)
    {
        this.momoCheckNow = yesOrNo;
    }
    private momoCheckNow: Boolean = false;
    private momoWatchTime: number = 0;
    private momoFPX: number = 2000; // 刷新率
    private tellMoMoWatch() { this.momoWatchTime = this.momoNow(); }
    private isMoMoWatch(now: number): Boolean
    {
        // console.log('isMoMoWatch', now - this.momoWatchTime, now - this.momoWatchTime < this.momoFPX);
        return now - this.momoWatchTime < this.momoFPX;
    }
    private async momoWatch()
    {
        const sleep = (milliseconds:number) => { return new Promise(resolve => setTimeout(resolve, milliseconds)); };

        console.log('momoWatch');
        var now = this.momoNow();
        if (!this.isMoMoWatch(now))
        {
            this.tellMoMoWatch();
            while(true)
            {
                await sleep(500);
                var now = this.momoNow();
                if (!this.isMoMoWatch(now))
                {
                    this.tellMoMoWatch();

                    if (!this.momoCheckNow) { continue; }
                    this.tellMoMoCheckNow(false);

                    // 刷本地命令
                    const path = this.emacsHome + this.valueHome;
                    const evsData = getFileUri(path, 'vscode_get_value');
                    const startCheckTime = this.momoNow();
                    const limitTime = 2 * 1000; // 秒
                    var evsDR = getDataString(await workspace.fs.readFile(evsData));
                    while (evsDR === '')
                    {
                        await sleep(10);
                        evsDR = getDataString(await workspace.fs.readFile(evsData));
                        if (isOutTime(startCheckTime, limitTime)) { break; }
                    }
                    if (evsDR === '') { continue; }
                    if (+evsDR.split(this.splitStr)[0] < 0) { continue; } // 是文件夹，跟位置无关
                    const evsCmdID = ''+evsDR.split(this.splitStr)[2];   // 校验命令的ID
                    // 新命令
                    if (evsCmdID !== this.evsIDBuffer)
                    {
                        // 没见过的命令，记录下来当成缓存命令
                        this.evsIDBuffer = evsCmdID;
                        this.evsPositionBuffer = +evsDR.split(this.splitStr)[0] - 1; // 光标位置
                        this.evsPathBuffer = ''+evsDR.split(this.splitStr)[1];       // 文件路径
                        this.BufferCmd();
                        continue;
                    }

                    // 旧的命令，我们这里检测它是否生效了

                    // 刷编辑器
                    var editor = window.activeTextEditor;
                    const startCheckTime00 = this.momoNow();
                    const limitTime00 = 200; // 毫秒
                    while (editor === undefined || !editor.document)
                    {
                        await sleep(10);
                        editor = window.activeTextEditor;
                        if (isOutTime(startCheckTime00, limitTime00)) { break; }
                    }
                    if (editor === undefined || !editor.document) { continue; }
                    const tryPosition = editor.document.offsetAt(editor.selection.active);
                    if (this.evsPositionBuffer !== tryPosition)
                    {
                        console.log('momo check now');
                        this.BufferCmd();
                    }
                }
            }
        }
    }

    // 初始化执行函数
    private async momoInitGo()
    {
        // 执一次
        if (!this.isInit) { return; }
        this.isInit = false;

        const sleep = (milliseconds:number) => { return new Promise(resolve => setTimeout(resolve, milliseconds)); };

        const path = this.emacsHome + this.valueHome;
        const evsData = getFileUri(path, 'vscode_you_should_be_here');

        const startCheckTime = this.momoNow();
        const limitTime = 2 * 1000; // 秒
        var evsDR = getDataString(await workspace.fs.readFile(evsData));
        while (evsDR === '')
        {
            await sleep(10);
            evsDR = getDataString(await workspace.fs.readFile(evsData));
            if (isOutTime(startCheckTime, limitTime)) { break; }
        }
        if (evsDR === '') { return; }

        if (+evsDR.split(this.splitStr)[0] < 0) { return; } // 是文件夹，跟位置无关
        const evsCmdID = ''+evsDR.split(this.splitStr)[2];   // 校验命令的ID
        if (evsCmdID === this.evsIDBuffer)
        {
            // 执行缓存命令
            this.BufferCmd();
        }
        else
        {
            // 没见过的命令，记录下来当成缓存命令
            this.evsIDBuffer = evsCmdID;
            this.evsPositionBuffer = +evsDR.split(this.splitStr)[0] - 1; // 光标位置
            this.evsPathBuffer = ''+evsDR.split(this.splitStr)[1];       // 文件路径
        }
    }

    private updateSelectFileData(editor: TextEditor)
    {
        this.updateSelectTime();
        this.selectFilePath = editor.document.uri.fsPath;
        this.selectFilePosition = editor.document.offsetAt(editor.selection.active) + 1;
    }


    // 呼吸函数
    private positionManagerBreath() {
        if (new Date().getTime() - this.breathVarP >= this.liveTime)
        { this.breathVarP = new Date().getTime(); }
    }


    // 呼吸函数
    private momoStupidBreath() {
        // if (new Date().getTime() - this.breathVarM >= this.liveTime)
        // { this.breathVarM = new Date().getTime(); }
        this.breathVarM = new Date().getTime();
    }

    // 监听器1，负责跳转文件以位置
    private async momoStupid()
    {
        const sleep = (milliseconds:number) => { return new Promise(resolve => setTimeout(resolve, milliseconds)); };

        this.momoStupidBreath();
        while (new Date().getTime() - this.breathVarM < this.liveTime)
        {
            await sleep(this.breathNumber);

            const path = this.emacsHome + this.valueHome;
            const evsData = getFileUri(path, 'vscode_get_value');


            const startCheckTime = this.momoNow();
            const limitTime = 2 * 1000; // 秒
            var evsDR = getDataString(await workspace.fs.readFile(evsData));
            while (evsDR === '')
            {
                await sleep(10);
                evsDR = getDataString(await workspace.fs.readFile(evsData));
                if (isOutTime(startCheckTime, limitTime)) { break; }
            }
            if (evsDR === '') { continue; }

            // --------------------多线程Bug--------------------

            if (+evsDR.split(this.splitStr)[0] < 0) { continue; } // 是文件夹，跟位置无关
            const evsCmdID = ''+evsDR.split(this.splitStr)[2];   // 校验命令的ID
            if (evsCmdID !== this.evsIDBuffer)
            {
                // 没见过的命令，记录下来当成缓存命令
                this.evsIDBuffer = evsCmdID;
                this.evsPositionBuffer = +evsDR.split(this.splitStr)[0] - 1; // 光标位置
                this.evsPathBuffer = ''+evsDR.split(this.splitStr)[1];       // 文件路径
            }
            // 执行缓存命令
            this.BufferCmd();
        }
    }

    // 缓存命令
    private async BufferCmd()
    {
        // 命令成功被执行(不等的情况有可能是没执行成功，还有可能是有新的缓存命令了)
        if (this.evsIDBuffer === this.cmdID) { return; }

        const sleep = (milliseconds:number) => { return new Promise(resolve => setTimeout(resolve, milliseconds)); };
        const startCheckTime00 = this.momoNow();
        const limitTime00 = 100; // 毫秒
        var editor = window.activeTextEditor;
        while (editor === undefined || !editor.document)
        {
            await sleep(10);
            editor = window.activeTextEditor;
            if (isOutTime(startCheckTime00, limitTime00)) { break; }
        }
        if (editor === undefined || !editor.document) { return; }


        // 刷的是正确路径的editor
        const startCheckTime01 = this.momoNow();
        const limitTime01 = 100; // 毫秒
        var editorPathS = editor.document.uri.fsPath;
        while (this.evsPathBuffer !== editorPathS)
        {
            await sleep(10);
            const tPath = window.activeTextEditor?.document.uri.fsPath;
            if (!tPath) { continue; }
            editorPathS = tPath;
            if (isOutTime(startCheckTime01, limitTime01)) { break; }
        }
        if (this.evsPathBuffer !== editorPathS) { return; }
        console.log('momo try-----');
        // 跳转位置
        let target = editor.document.positionAt(clamp(this.evsPositionBuffer, 0));
        target = editor.document.validatePosition(target);
        editor.revealRange(new Range(target, target), TextEditorRevealType.InCenter);
        editor.selection = new Selection(target, target);
        const tryPosition = editor.document.offsetAt(editor.selection.active);
        // 位置对了，表示命令已经执行，记录下命令ID
        if (this.evsPositionBuffer === tryPosition) { this.evsCmdDone(this.evsIDBuffer); }
        this.tellMoMoCheckNow(true);
    }



}

// 在检测的时间里
function isOutTime(startTime:number, limitTime:number):Boolean
{
    return new Date().getTime() - startTime > limitTime;
}

function getDataString(data:Uint8Array):string
{
    return Buffer.from(data).toString('utf8').replace(/\r|\n/ig,"");
}

function getFileUri(fileDir:string, fileName:string):Uri
{
    const dir = Uri.file(fileDir);
    const file = dir.with({ path: posix.join(dir.path, fileName) });
    return file;
}

function clamp(val: any, min: any, max = Infinity) {
    if (val < min) { return min; }
    if (val > max) { return max; }
    return val;
}
