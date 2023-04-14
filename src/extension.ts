import * as vscode from 'vscode';

/**
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

	let issetSiteId = false;
	// 正則表達式的類型
	let type: RegExpExecArray | null;

	// 開啟檔案後填寫修改的站台 id
	let opend = vscode.workspace.onDidOpenTextDocument((e) => {
		console.log('opend');
		let openRegx = new RegExp('//\\s*##目前要修改的站台\\s*id：XXX', 'gm');
		// 有設置填寫站台 id 的字串，該檔案會跳出填寫站台 id 的訊息
		if ((type = openRegx.exec(e.getText())) !== null) {
			vscode.window.showWarningMessage('請填寫目前要修改的站台 id !!', '確定');
			issetSiteId = true;
		} else {
			issetSiteId = false;
		}
	});

	// 存檔時做的事
	let saved = vscode.workspace.onDidSaveTextDocument((e) => {
		console.log('saved');
		let savedRegx = new RegExp('//\\s*##目前要修改的站台\\s*id：\\d+', 'gm');
		// 有 id 字串，就
		if ((type = savedRegx.exec(e.getText())) !== null) {
			vscode.window.showInformationMessage('您的文件已修改');
		} else if (issetSiteId) {
			// 存檔時沒有 id 字串，就繼續跳警告訊息
			vscode.window.showWarningMessage('請填寫目前要修改的站台 id !!', '確定');
		}
	});

	// 關閉檔案後的行為
	let closed = vscode.workspace.onDidCloseTextDocument((e) => {
		console.log('closed');
		let closedRegx = new RegExp('//\\s*##目前要修改的站台\\s*id：\\d+', 'gm');
		// 如果站台 id 還存在時，跳錯誤訊息並打開已關閉的檔案
		if ((type = closedRegx.exec(e.getText())) !== null) {
			let filename = e.fileName.replace(/^.*[\\\/]/, '');
			vscode.window.showErrorMessage(`您尚未復原 ${filename} 檔案內的站台 id 的註解!!`, '確定');
			vscode.commands.executeCommand('workbench.action.reopenClosedEditor');
		}
	});

	context.subscriptions.push(opend, closed, saved);
}

export function deactivate() { }
