const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

function activate(context) {
	// Змінна для зберігання актуальної конфігурації
	let currentConfig = vscode.workspace.getConfiguration('viteHtmlComponentCreator')
	let defaultImports = currentConfig.get('defaultImports') || {
		html_imports: ["<link rel='stylesheet' href='@c/{component}/{component}.scss'/>"],
		scss_imports: ["@import 'src/scss/imports';"]
	}

	// Ініціалізація налаштувань при першому запуску
	const currentImports = currentConfig.inspect('defaultImports')
	if (!currentImports.globalValue && !currentImports.workspaceValue) {
		const defaultValue = {
			html_imports: ["<link rel='stylesheet' href='@c/{component}/{component}.scss'/>"],
			scss_imports: ["@import 'src/scss/imports';"]
		}

		vscode.window.showInformationMessage(
			'Налаштування defaultImports не ініціалізовано. Ініціалізувати зараз?',
			'Так',
			'Ні'
		).then((choice) => {
			if (choice === 'Так') {
				currentConfig.update('defaultImports', defaultValue, vscode.ConfigurationTarget.Global)
					.then(() => {
						vscode.window.showInformationMessage('Налаштування defaultImports успішно ініціалізовано!')
					}, (error) => {
						vscode.window.showErrorMessage('Помилка при ініціалізації налаштувань: ' + error.message)
					})
			}
		})
	}

	// Підписка на зміни конфігурації
	const configListener = vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration('viteHtmlComponentCreator.defaultImports')) {
			currentConfig = vscode.workspace.getConfiguration('viteHtmlComponentCreator')
			defaultImports = currentConfig.get('defaultImports') || {
				html_imports: ["<link rel='stylesheet' href='@c/{component}/{component}.scss'/>"],
				scss_imports: ["@import 'src/scss/imports';"]
			}
			vscode.window.showInformationMessage('Налаштування defaultImports оновлено!')
		}
	})
	context.subscriptions.push(configListener)

	// Реєстрація команди для створення компонента
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
			},
		})

		if (!componentName) {
			return
		}

		const componentFolder = path.join(uri.fsPath, componentName)
		const htmlFile = path.join(componentFolder, `${componentName}.html`)
		const scssFile = path.join(componentFolder, `${componentName}.scss`)

		// Перевірка коректності налаштувань
		if (
			!defaultImports ||
			!Array.isArray(defaultImports.html_imports) ||
			!Array.isArray(defaultImports.scss_imports)
		) {
			vscode.window.showWarningMessage('Налаштування defaultImports мають некоректний формат. Використано значення за замовчуванням.')
			defaultImports = {
				html_imports: ["<link rel='stylesheet' href='@c/{component}/{component}.scss'/>"],
				scss_imports: ["@import 'src/scss/imports';"]
			}
		}

		try {
			if (!fs.existsSync(componentFolder)) {
				fs.mkdirSync(componentFolder, { recursive: true })
			}

			// Формування імпортів для HTML
			const htmlImports = defaultImports.html_imports
				.map((imp) => imp.replace(/{component}/g, componentName))
				.filter((imp) => imp.trim() !== '')
				.join('\n')

			// Формування імпортів для SCSS
			const scssImports = defaultImports.scss_imports
				.filter((imp) => imp.trim() !== '')
				.join('\n')

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
	deactivate,
}