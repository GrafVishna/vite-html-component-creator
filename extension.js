const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

function activate(context) {
	let disposable = vscode.commands.registerCommand('vite-html-component-creator.createComponent', async (uri) => {
		if (!uri || !uri.fsPath) {
			vscode.window.showErrorMessage('Будь ласка, виберіть папку в провіднику.')
			return
		}

		const componentName = await vscode.window.showInputBox({
			prompt: 'Введіть назву компонента',
			placeHolder: 'MyComponent',
			validateInput: (value) => {
				if (!value || value.trim() === '') {
					return 'Назва компонента не може бути порожньою!'
				}
				if (!/^[a-zA-Z0-9-]+$/.test(value)) {
					return 'Назва може містити лише літери, цифри та дефіс!'
				}
				return null
			}
		})

		if (!componentName) {
			return
		}

		const componentFolder = path.join(uri.fsPath, componentName)
		const htmlFile = path.join(componentFolder, `${componentName}.html`)
		const scssFile = path.join(componentFolder, `${componentName}.scss`)

		// Отримання налаштувань
		const config = vscode.workspace.getConfiguration('viteHtmlComponentCreator')
		let defaultImports
		try {
			defaultImports = JSON.parse(config.get('defaultImports'))
		} catch (error) {
			vscode.window.showErrorMessage('Помилка в форматі JSON налаштувань: ' + error.message)
			defaultImports = { html: [], scss: [] }
		}

		try {
			if (!fs.existsSync(componentFolder)) {
				fs.mkdirSync(componentFolder, { recursive: true })
			}

			// Формування імпортів для HTML
			const htmlImports = [
				...defaultImports.html,
				`<link rel="stylesheet" href="./${componentName}.scss">`
			].join('\n')

			// Формування імпортів для SCSS
			const scssImports = defaultImports.scss.join('\n')

			// Створення HTML-файлу
			const htmlContent = `${htmlImports}\n\n<div class="${componentName}">\n  <!-- Ваш контент тут -->\n</div>`
			fs.writeFileSync(htmlFile, htmlContent)

			// Створення SCSS-файлу
			const scssContent = `${scssImports}${scssImports ? '\n' : ''}.${componentName} {\n  /* Стилі компонента */\n}\n`
			fs.writeFileSync(scssFile, scssContent)

			vscode.window.showInformationMessage(`Компонент "${componentName}" успішно створено!`)
		} catch (error) {
			vscode.window.showErrorMessage(`Помилка при створенні компонента: ${error.message}`)
		}
	})

	context.subscriptions.push(disposable)
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}