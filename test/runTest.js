const path = require('path')
const { runTests } = require('@vscode/test-electron')

async function main() {
   try {
      // Шлях до твого розширення
      const extensionDevelopmentPath = path.resolve(__dirname, '../')

      // Шлях до тестового скрипта
      const extensionTestsPath = path.resolve(__dirname, './suite/index')

      // Шлях до тимчасового робочого простору для тестів
      const testWorkspace = path.resolve(__dirname, '../test-workspace')

      // Запуск тестів
      const result = await runTests({
         extensionDevelopmentPath,
         extensionTestsPath,
         launchArgs: [
            testWorkspace,
            '--disable-extensions', // Вимикаємо інші розширення для чистоти тесту
            '--no-sandbox'         // Додаємо для стабільності в CI/CD
         ]
      })

      if (result !== 0) {
         throw new Error('Тести не пройшли')
      }

      console.log('Тести успішно пройдені!')
   } catch (err) {
      console.error('Помилка при запуску тестів:', err)
      process.exit(1)
   }
}

main()