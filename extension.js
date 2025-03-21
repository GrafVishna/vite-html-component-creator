const vscode = require('vscode')
const fs = require('fs').promises
const path = require('path')

// Ініціалізація конфігурації
async function initializeConfig(currentConfig) {
	const currentImports = currentConfig.inspect('defaultImports')
	if (!currentImports.globalValue && !currentImports.workspaceValue) {
		const defaultValue = { html_imports: [], scss_imports: [] }
		const choice = await vscode.window.showInformationMessage(
			'Налаштування defaultImports не ініціалізовано. Ініціалізувати зараз?',
			'Так',
			'Ні'
		)
		if (choice === 'Так') {
			await currentConfig.update('defaultImports', defaultValue, vscode.ConfigurationTarget.Global)
				.then(() => {
					vscode.window.showInformationMessage('Налаштування defaultImports успішно ініціалізовано!')
				}, (error) => {
					vscode.window.showErrorMessage(`Помилка при ініціалізації налаштувань: ${error.toString()}`)
				})
		}
	}
}

// Оновлення конфігурації при зміні
function setupConfigListener(context, updateConfigCallback) {
	const configListener = vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration('viteHtmlComponentCreator.defaultImports')) {
			updateConfigCallback()
			vscode.window.showInformationMessage('Налаштування defaultImports оновлено!')
		}
	})
	context.subscriptions.push(configListener)
}

// Отримання назви компонента
async function getComponentName() {
	const componentName = await vscode.window.showInputBox({
		prompt: 'Введіть назву компонента',
		placeHolder: 'MyComponent',
		validateInput: (value) => {
			if (!value || value.trim() === '') return 'Назва компонента не може бути порожньою!'
			if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(value)) {
				return 'Назва може містити лише літери, цифри та дефіс, і не починатися з дефіса!'
			}
			return null
		},
	})
	if (!componentName) {
		vscode.window.showInformationMessage('Створення компонента скасовано.')
		return null
	}
	return componentName
}

// Перевірка та створення папки компонента
async function ensureComponentFolder(componentFolder, componentName) {
	if (await fs.stat(componentFolder).catch(() => false)) {
		const overwrite = await vscode.window.showWarningMessage(
			`Папка "${componentName}" уже існує! Відхилено!`,
			'Зрозуміло'
		)
		if (overwrite === 'Зрозуміло') {
			vscode.window.showInformationMessage('Створення компонента скасовано.')
			return false
		}
	} else {
		await fs.mkdir(componentFolder, { recursive: true })
	}
	return true
}

// Генерація вмісту файлів
function generateFileContents(componentName, defaultImports) {
	const htmlImports = defaultImports.html_imports
		.map((imp) => imp.replace(/{component}/g, componentName))
		.filter(Boolean)
		.join('\n')

	const scssImports = defaultImports.scss_imports
		.filter(Boolean)
		.join('\n')

	const htmlCmntImp = htmlImports ? '<!-- ====== Imports ====== -->\n' : ''
	const htmlCmntComp = '<!-- ====== Component ====== -->\n'
	const scssCmntImp = scssImports ? '// ====== Imports ======\n' : ''
	const scssCmntComp = '// ====== Component ======\n'

	const htmlContent = `${htmlCmntImp}${htmlImports}${htmlImports ? '\n\n' : '\n'}${htmlCmntComp}<div class="${componentName}">\n  <!-- Ваш контент тут -->\n</div>`
	const scssContent = `${scssCmntImp}${scssImports}${scssImports ? '\n\n' : ''}${scssCmntComp}.${componentName} {\n  /* Стилі компонента */\n}`

	return { htmlContent, scssContent }
}

// Створення файлів компонента
async function createComponentFiles(componentFolder, componentName, htmlContent, scssContent) {
	const htmlFile = path.join(componentFolder, `${componentName}.html`)
	const scssFile = path.join(componentFolder, `${componentName}.scss`)
	await Promise.all([
		fs.writeFile(htmlFile, htmlContent),
		fs.writeFile(scssFile, scssContent)
	])
}

async function activate(context) {
	let currentConfig = vscode.workspace.getConfiguration('viteHtmlComponentCreator')
	let defaultImports = currentConfig.get('defaultImports') || { html_imports: [], scss_imports: [] }

	await initializeConfig(currentConfig)

	setupConfigListener(context, () => {
		currentConfig = vscode.workspace.getConfiguration('viteHtmlComponentCreator')
		defaultImports = currentConfig.get('defaultImports') || { html_imports: [], scss_imports: [] }
	})

	let disposable = vscode.commands.registerCommand('vite-html-component-creator.createComponent', async (uri) => {
		if (!uri || !uri.fsPath) {
			vscode.window.showErrorMessage('Будь ласка, виберіть папку в провіднику.')
			return
		}

		const componentName = await getComponentName()
		if (!componentName) return

		const componentFolder = path.join(uri.fsPath, componentName)

		if (!defaultImports || !Array.isArray(defaultImports.html_imports) || !Array.isArray(defaultImports.scss_imports)) {
			vscode.window.showWarningMessage('Налаштування defaultImports мають некоректний формат. Використано значення за замовчуванням.')
			defaultImports = { html_imports: [], scss_imports: [] }
		}

		try {
			if (!(await ensureComponentFolder(componentFolder, componentName))) return

			const { htmlContent, scssContent } = generateFileContents(componentName, defaultImports)
			await createComponentFiles(componentFolder, componentName, htmlContent, scssContent)

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