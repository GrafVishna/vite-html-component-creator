const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vscode = require('vscode')

describe('Vite HTML Component Creator Tests', function () {
   this.timeout(10000) // Збільшуємо таймаут до 10 секунд

   // Шлях до тестового робочого простору
   const workspacePath = path.resolve(__dirname, '../../test-workspace')
   const testComponentName = 'TestComponent'
   const componentFolder = path.join(workspacePath, testComponentName)
   const htmlFile = path.join(componentFolder, `${testComponentName}.html`)
   const scssFile = path.join(componentFolder, `${testComponentName}.scss`)

   // Очищення перед тестом
   before(async () => {
      if (fs.existsSync(componentFolder)) {
         fs.rmSync(componentFolder, { recursive: true, force: true })
      }
   })

   // Тест створення компонента
   it('should create a component with HTML and SCSS files', async () => {
      // Симулюємо вибір папки в провіднику
      const uri = vscode.Uri.file(workspacePath)

      // Виконуємо команду створення компонента
      await vscode.commands.executeCommand(
         'vite-html-component-creator.createComponent',
         uri
      )

      // Симулюємо введення назви компонента (потрібно вручну підмінити в тестовому режимі)
      // У реальному VS Code це робить користувач через showInputBox
      // Для тесту припустимо, що назва "TestComponent" уже введена
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Чекаємо завершення

      // Перевіряємо, чи створено папку та файли
      assert.ok(fs.existsSync(componentFolder), 'Папка компонента не створена')
      assert.ok(fs.existsSync(htmlFile), 'HTML-файл не створений')
      assert.ok(fs.existsSync(scssFile), 'SCSS-файл не створений')

      // Перевіряємо вміст HTML-файлу
      const htmlContent = fs.readFileSync(htmlFile, 'utf8')
      assert.ok(
         htmlContent.includes(`<link rel="stylesheet" href="src/html/components/${testComponentName}/${testComponentName}.scss">`),
         'HTML не містить правильний імпорт стилів'
      )
      assert.ok(
         htmlContent.includes(`<div class="${testComponentName}">`),
         'HTML не містить правильний div'
      )

      // Перевіряємо вміст SCSS-файлу
      const scssContent = fs.readFileSync(scssFile, 'utf8')
      assert.ok(
         scssContent.includes("@import 'src/scss/imports';"),
         'SCSS не містить правильний імпорт'
      )
      assert.ok(
         scssContent.includes(`.${testComponentName} {`),
         'SCSS не містить правильний клас'
      )
   })

   // Очищення після тесту
   after(() => {
      if (fs.existsSync(componentFolder)) {
         fs.rmSync(componentFolder, { recursive: true, force: true })
      }
   })
})