import * as vscode from 'vscode';

/**
 * @param context 
 */
export function activate(context: vscode.ExtensionContext) {

	let file: String[] = [];
	let type: RegExpExecArray | null;

	let opend = vscode.workspace.onDidOpenTextDocument((e) => {
		let openRegx = new RegExp('//\\s*##目前要修改的站台id：XXX', 'gm');
		// 如果是需要做判斷的檔案
		if ((type = openRegx.exec(e.getText())) !== null) {
			// 跳警告提醒要填寫 id
			vscode.window.showWarningMessage('請填寫目前要修改的站台 id，填寫後才能編輯!!', '確定!!');
			// 將檔案存入陣列
			file.push(e.fileName);
		}
	});

	let didSaved = vscode.workspace.onDidSaveTextDocument((e) => {
		let siteid;
		let editor = vscode.window.activeTextEditor;
		let savedRegx = new RegExp('//\\s*##目前要修改的站台id：\\d+', 'gm');
		// 如果是需要判斷的檔案
		if (e.getText().includes('##目前要修改的站台id：') && editor !== undefined) {
			// 編輯的內容字段
			let editText = e.lineAt(editor.selection.end).text;
			// 編輯的內容行數
			let editLine = e.lineAt(editor.selection.end).lineNumber + 1;
			let settingStringIndex = e.getText().indexOf('##目前要修改的站台id：');
			// 抓到現在設定的站台
			siteid = parseInt(e.getText()[settingStringIndex + 13] + e.getText()[settingStringIndex + 14] + e.getText()[settingStringIndex + 15] + e.getText()[settingStringIndex + 16]);

			// 如果不是正確關閉檔案，是直接關閉視窗
			if (!file.includes(e.fileName)) {
				// 將檔名紀錄起來
				file.push(e.fileName);
				if (!Number.isNaN(siteid)) {
					// 告知目前設定的站台
					vscode.window.showWarningMessage(`請確認目前要修改的站台 id 為 ${siteid} !!`, '確定');
				} else {
					// 如果編輯的內容不是設定站台 id，就復原編輯動作並跳警告
					if ((type = savedRegx.exec(e.getText())) === null) {
						vscode.commands.executeCommand('undo');
						vscode.window.showWarningMessage('請填寫目前要修改的站台 id，填寫後才能編輯!!', '好的!!');
					}
				}
			} else {
				// 如果有從預設字串改成站台 id
				if ((type = savedRegx.exec(e.getText())) !== null) {
					// 告知目前修改的站台
					vscode.window.showInformationMessage(`目前正在修改 ${siteid} 站`);
				} else {
					// 如果編輯的內容不是把字串回復成預設，就復原編輯動作並跳警告
					if (editText !== '// ##目前要修改的站台id：XXX') {
						vscode.commands.executeCommand('undo');
						vscode.window.showWarningMessage('請填寫目前要修改的站台 id，填寫後才能編輯!!', '好的!!');
					}
				}
			}
		}
	});

	let closed = vscode.workspace.onDidCloseTextDocument((e) => {
		let closedRegx = new RegExp('//\\s*##目前要修改的站台id：\\d+', 'gm');
		// 如果是有 id 未刪除的字串的檔案
		if ((type = closedRegx.exec(e.getText())) !== null) {
			let filename = e.fileName.replace(/^.*[\\\/]/, '');
			// 開啟已關閉的檔案
			vscode.commands.executeCommand('workbench.action.reopenClosedEditor');
			// 提醒將字串更改為預設
			vscode.window.showErrorMessage(`您尚未復原 ${filename} 檔案內的站台 id 的註解!!`, '確定');
			// 如果已將字串改回預設，但陣列中有紀錄
		} else if (file.includes(e.fileName)) {
			const index = file.indexOf(e.fileName);
			// 將該檔案從陣列中移除
			if (index > -1) {
				file.splice(index, 1);
			}
		}
	});

	context.subscriptions.push(opend, closed, didSaved);
}

export function deactivate() { }
