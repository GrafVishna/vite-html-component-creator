const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

function activate(context) {
	let disposable = vscode.commands.registerCommand('vite-html-component-creator.createComponent', async (uri) => {
		// Перевірка, чи викликано з контекстного меню папки
		if (!uri || !uri.fsPath) {
			vscode.window.showErrorMessage('Будь ласка, виберіть папку в провіднику.')
			return
		}

		// Показати поле для введення назви компонента
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
			return // Користувач скасував введення
		}

		// Шлях до нової папки компонента
		const componentFolder = path.join(uri.fsPath, componentName)
		const htmlFile = path.join(componentFolder, `${componentName}.html`)
		const scssFile = path.join(componentFolder, `${componentName}.scss`)

		try {
			// Створити папку компонента
			if (!fs.existsSync(componentFolder)) {
				fs.mkdirSync(componentFolder, { recursive: true })
			}

			// Створити HTML-файл із підключенням SCSS
			const htmlContent = `<link rel="stylesheet" href="./${componentName}.scss">\n\n<div class="${componentName}">\n  <!-- Ваш контент тут -->\n</div>`
			fs.writeFileSync(htmlFile, htmlContent)

			// Створити SCSS-файл
			const scssContent = `.${componentName} {\n  /* Стилі компонента */\n}\n`
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