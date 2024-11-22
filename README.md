# icbc-road-test-booking

**ICBC 路考预约助手脚本**

这个 JavaScript 脚本帮助你定时检测 ICBC 路考考位。根据规则如果找到合适的考位，程序会播放音频提醒你，并调用接口锁定考位并发送邮件或短信验证码告知你。该脚本需要在 PC 上运行，推荐使用 Chrome 浏览器。

## 功能

- **自动刷新**：每隔1分钟请求一次，查找符合条件的考位。
- **音频提醒**：当找到合适的考位时，程序会播放音频通知，并锁定及发送官方通知邮件或短信。
- **自定义配置**：可自定义日期和时段、考点过滤。

## 使用方法

1. **复制代码**：
   - 复制下方代码并修改变量值，主要修改前4行变量
   ```javascript
   let lastName = ''; // Driver's last name.
   let licenceNumber = ''; // Driver's licence number.
   let keyword = ''; // Typically the mother's last name.
   let officeName = 'vancouver'; // Road test office name, e.g. "vancouver", "Richmond claim centre". Leave it blank to get all offices for you to choose one.
   let startDate = ''; // Earliest date in yyyy-MM-dd format, e.g. 2024-12-05, leave it blank to indicate today.
   let endDate = ''; // Latest date in yyyy-MM-dd format, leave it blank to indicate one month later.
   let daysOfWeek = '[0,1,2,3,4,5,6]'; // Weeks filter, do not change if you don't need.
   let startTime = '08:00'; // Earliest time in HH:mm format, e.g. 09:15.
   let endTime = ''; // Latest time in HH:mm format, e.g. 13:00, leave it blank to indicate all time.
   let examType = ''; // Road test type, Class 5 is '5-R-1', leave it blank to auto-fetch.
   let autoLock = true; // Whether to lock appointment automatically when a matching test slot is found.
   let useSMS = false; // Set true indicate send appointment information by SMS or else email after locking.

   fetch('https://raw.githubusercontent.com/softlxf/icbc-road-test-booking/main/main.js')
     .then(response => response.text())
     .then(script => 
       new Function(`return (async () => { ${script} })();`)()
     )
     .catch(error => console.error('Error:', error));
   ```

2. **访问预约页面**：
   - 在浏览器中打开 ICBC 路考预约网站：[https://onlinebusiness.icbc.com/webdeas-ui/home](https://onlinebusiness.icbc.com/webdeas-ui/home)。

3. **运行脚本**：
   - 按 `F12` 打开浏览器的开发者工具，切换到 **Console** 面板。
   - 将修改后的 `代码` 复制并粘贴到 Console 面板中，按回车执行。

4. **自动刷新**：
   - 执行成功后，脚本会每隔1分钟自动刷新一次页面，检查是否有符合日期范围的考位。
   - 如果找到合适的考位，程序会播放音频提醒你（请调节好电脑音量）。

5. **注意事项**：
   - 请确保浏览器页面没有最小化。
   - 建议关闭电脑的自动锁屏及睡眠功能，以避免音频播放失败。
