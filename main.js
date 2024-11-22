// Remove the // comments in front of the following parameters and update them with your own information.
// Open the ICBC road test appointment website https://onlinebusiness.icbc.com/webdeas-ui/home, recommended to use Chrome browser. Then press the F12 key to open the 'Developer tools' and switch to the Console tab. Copy the script file content and paste it into the Console tab, then press Enter to execute it.
// If there are no errors, the code will execute once every 60 seconds. When a matching date and time range for available test slots is found, a sound reminder will play (please adjust your computer's volume).
// Make sure the current page of the browser is not minimized and the system does not automatically lock or sleep.

//let lastName = ''; // Driver's last name.
//let licenceNumber = ''; // Driver's licence number.
//let keyword = ''; // Typically the mother's last name.
//let officeName = 'vancouver'; // Road test office name, e.g. "vancouver", "Richmond claim centre". Leave it blank to get all offices for you to choose one.
//let startDate = ''; // Earliest date in yyyy-MM-dd format, e.g. 2024-12-05, leave it blank to indicate today.
//let endDate = ''; // Latest date in yyyy-MM-dd format, leave it blank to indicate one month later.
//let daysOfWeek = '[0,1,2,3,4,5,6]'; // Weeks filter, do not change if you don't need.
//let startTime = '08:00'; // Earliest time in HH:mm format, e.g. 09:15.
//let endTime = ''; // Latest time in HH:mm format, e.g. 13:00, leave it blank to indicate all time.
//let examType = ''; // Road test type, Class 5 is '5-R-1', leave it blank to auto-fetch.
//let autoLock = true; // Whether to lock appointment automatically when a matching test slot is found.
//let useSMS = false; // Set true indicate send appointment information by SMS or else email after locking.

async function validateParameters() {
    if (typeof lastName == 'undefined')
        lastName = '';
    if (typeof licenceNumber == 'undefined')
        licenceNumber = '';
    if (typeof keyword == 'undefined')
        keyword = '';
    if (typeof officeName == 'undefined')
        officeName = '';
    if (typeof startDate == 'undefined' || !startDate) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        startDate = `${year}-${month}-${day}`;
    }
    if (typeof endDate == 'undefined' || !endDate) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        endDate = `${year}-${month}-${day}`;
    }
    if (typeof daysOfWeek == 'undefined' || !daysOfWeek)
        daysOfWeek = '[0,1,2,3,4,5,6]';
    if (typeof startTime == 'undefined' || !startTime)
        startTime = '08:00';
    if (typeof endTime == 'undefined')
        endTime = '';
    if (typeof examType == 'undefined')
        examType = '';
    if (typeof autoLock == 'undefined')
        autoLock = true;
    if (typeof useSMS == 'undefined')
        useSMS = false;
    if (typeof timerId == 'undefined')
        timerId = 0;
    const info = `Current running parameters>>>\nlastName: ${lastName}\nlicenceNumber: ${licenceNumber}\nkeyword: ${keyword}\nofficeName: ${officeName}\nstartDate: ${startDate}\nendDate: ${endDate}\ndaysOfWeek: ${daysOfWeek}\nstartTime: ${startTime}\nendTime: ${endTime}\nexamType: ${examType}\nautoLock: ${autoLock}\nuseSMS: ${useSMS}`;
    console.info(getDate(), info);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function playAudio() {
    const audio = new Audio('https://www.soundjay.com/phone/telephone-ring-03a.wav');
    audio.play();
}

function showSelect(title, options, callback) {
    const overlay = document.createElement('div');
    overlay.id = 'overlay-select';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 2000;`;
    const optionElements = options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
    overlay.innerHTML = `<div style="background: white; width: 500px; max-height: 500px; padding: 20px; border-radius: 10px; text-align: center;">
		<div style="margin-bottom: 10px;">${title}</div>
		<select style="width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px;">
		  ${optionElements}
		</select>
		<button style="padding: 10px 20px; background: #00aeef; color: white; border: none; border-radius: 5px; cursor: pointer;">Confirm</button>
	  </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('button').onclick = () => {
        const value = overlay.querySelector('select').value;
        if (!value)
            return;
        document.body.removeChild(overlay);
        if (callback)
            callback(value);
    };
}

function showContent(title, content, color) {
    let overlayContent = document.querySelector('#overlay-content');
    if (!overlayContent) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 2000;`;
        if (!color)
            color = 'black';
        overlay.innerHTML = `<div id="overlay-content" style="background: white; width: 500px; padding: 20px; border-radius: 10px; text-align: center;">
			<div style="margin-bottom: 10px; color:${color};">${title}</div>
			<div style="margin-bottom: 10px; display: flex; flex-wrap: wrap;">${content}</div>
			<button style="padding: 10px 20px; background: #00aeef; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
		  </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => {
            document.body.removeChild(overlay);
        };
        overlay.onclick = (event) => {
            if (event.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
    } else {
        overlayContent.querySelector('div:nth-child(1)').textContent = title;
        overlayContent.querySelector('div:nth-child(2)').innerHTML = content;
    }
}

function showStatus(message) {
    let statusMessage = document.querySelector('#status-message');
    if (statusMessage) {
        statusMessage.innerText = message;
    } else {
        let matToolbar = document.querySelector('mat-toolbar');
        if (matToolbar) {
            //matToolbar.style.removeProperty('width');
            const span = document.createElement('span');
            span.id = 'status-message';
            span.title = 'Click to quick sign in';
            span.style.cssText = `color:orange;cursor: pointer;`;
            span.innerText = message;
            const thirdChild = matToolbar.children[2];
            if (thirdChild) {
                matToolbar.insertBefore(span, thirdChild);
            }
            span.onclick = (event) => {
                signInPage();
            };
        }
    }
}

function httpRequest(method, api, requestBody) {
    const headers = {
        'Content-Type': 'application/json',
        'Referer': 'https://onlinebusiness.icbc.com/webdeas-ui/booking',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };
    if (api != 'webLogin/webLogin') {
        headers.Authorization = localStorage.getItem('AUTH_TOKEN');
        headers.Referer = 'https://onlinebusiness.icbc.com/webdeas-ui/login;type=driver';
    }
    return fetch('https://onlinebusiness.icbc.com/deas-api/v1/' + api, {
        method: method,
        headers: headers,
        body: JSON.stringify(requestBody),
    }).then(response => {
        if (!response.ok) {
            if (response.status != 400 && response.status != 403) {
                console.error(getDate(), `HTTP error, status: ${response.status}`);
            }
            return response.status;
        }
        if (api == 'webLogin/webLogin') {
            localStorage.setItem('AUTH_TOKEN', response.headers.get('Authorization'))
        }
        return response.json();
    }).catch(error => {
        console.error(getDate(), 'Error occurred:' + error);
        return 0;
    });
}
let drvrId = 0;
async function signIn() {
    if (!(lastName && licenceNumber && keyword)) {
        return false;
    }
    console.info(getDate(), 'Sign in the system')
    const data = await httpRequest('PUT', 'webLogin/webLogin', {
        drvrLastName: lastName,
        licenceNumber: licenceNumber,
        keyword: keyword
    });
    if (data == 400 || data == 403) {
        clearInterval(timerId);
        showStatus('(Script stopped)');
        console.error(getDate(), 'Failed to sign in, script stopped');
    }
    if (data && data.drvrId) {
        drvrId = data.drvrId;
    }
    return data;
}

async function signInPage() {
    const signOutButton = document.querySelector('.sign-out-button');
    if (signOutButton) {
        if (lastName && licenceNumber && keyword) {
            return true;
        }
        console.info(getDate(), 'Sign out of the system')
        signOutButton.click();
        await delay(3000);
    }
    let nextButton = document.querySelector('button.primary');
    if (nextButton.innerText == 'Next') {
        nextButton.click();
        await delay(3000);
    }
    const drvrLastNameInput = document.querySelector('input[formcontrolname="drvrLastName"]');
    const licenceNumberInput = document.querySelector('input[formcontrolname="licenceNumber"]');
    const keywordInput = document.querySelector('input[formcontrolname="keyword"]');
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        if (!(lastName && licenceNumber && keyword)) {
            submitButton.addEventListener('click', (event) => {
                lastName = drvrLastNameInput.value;
                licenceNumber = licenceNumberInput.value;
                keyword = keywordInput.value;
            });
            console.error('Please sign in system or set lastName, licenceNumber, keyword variables to continue');
            return false;
        }
    } else {
        throw new Error('Not in sign in page');
    }
    drvrLastNameInput.value = lastName;
    drvrLastNameInput.dispatchEvent(new Event('input'));
    licenceNumberInput.value = licenceNumber;
    licenceNumberInput.dispatchEvent(new Event('input'));
    keywordInput.value = keyword;
    keywordInput.dispatchEvent(new Event('input'));
    const checkbox = document.getElementsByClassName('mat-checkbox-layout')[0];
    const parentCheckbox = checkbox.closest('.mat-checkbox');
    const isChecked = parentCheckbox.classList.contains('mat-checkbox-checked');
    if (!isChecked) {
        checkbox.click();
    }
    console.warn(getDate(), 'Sign in the system')
    submitButton.click();
    await delay(3000);
    if (document.body.innerText.includes('Sign in')) {
        clearInterval(timerId);
        showStatus('(Script stopped)');
        console.error(getDate(), 'Failed to sign in, script stopped');
    }
    return true;
}

async function getExamType() {
    const data = await signIn();
    if (data && data.eligibleExams) {
        let content = '';
        let match = [];
        data.eligibleExams.forEach(item => {
            match.push({
                value: item.code,
                label: item.description
            });
        });
        if (match.length == 0) {
            content = '<div style="color:red">No eligible exams, please set examType variable then re-run the script</div>' + content;
            clearInterval(timerId);
            showStatus('(Script stopped)');
            throw new Error('No eligible exams, please set examType variable then re-run the script.');
        } else if (match.length == 1) {
            examType = match[0].value;
            console.warn(getDate(), `You can set the variable examType to '${examType}' for optimization.`);
            return true;
        } else {
            showSelect('Please select a exam to continue script', match, value => {
                examType = value;
                console.warn(getDate(), `You can set the variable examType to '${examType}' for optimization.`);
                actionSearch();
                timerId = setInterval(() => actionSearch(), 60000);
            });
            clearInterval(timerId);
            showStatus('(Script stopped)');
            console.error(getDate(), 'Please select a exam or update the examType variable then re-run the script.');
        }
    }
    return false;
}

let lastLockItem = null;
let lockCount = 0;
async function lockAppointment(item) {
    if (lastLockItem && lastLockItem.appointmentDt.date == item.appointmentDt.date && lastLockItem.startTm == item.startTm) {
        return;
    }
    if (lockCount > 10) {
        return;
    }
    delete item.lemgMsgId;
    item = {
        ...item,
        drscDrvSchl: {},
        instructorDlNum: null,
        bookedTs: getDate().replace(' ', 'T'),
        drvrDriver: {
            drvrId
        }
    };
    lockCount++;
    lastLockItem = item;
    const data = await httpRequest('PUT', 'web/lock', item);
    if (data == 400 || data == 403) {
        await signIn();
        return;
    }
    if (!data || data.statusCode != 'LOCKED') {
        console.info(getDate(), `Failed to lock appointment ${item.appointmentDt.date} ${item.startTm} ${data.statusCode}`);
        return;
    }
    const drvrDriver = data.drvrDriver;
    console.info(getDate(), `Appointment [${item.appointmentDt.date} ${item.startTm}] ${data.statusCode}`);
    if (useSMS === true || useSMS === false) {
        setTimeout(async() => {
            const bookedTs = getDate().replace(' ', 'T');
            const data = await httpRequest('POST', 'web/sendOTP', {
                bookedTs,
                drvrID: drvrId,
                method: useSMS ? 'S' : 'E'
            });
            if (data == 400 || data == 403) {
                await signIn();
                return;
            }
            console.info(getDate(), 'Sent verification code to ' + (useSMS ? drvrDriver.phoneNum : drvrDriver.email));
        }, 3000);
    }
}

let posId = 0;
let times = 0;
async function actionSearch() {
    if (!(lastName && licenceNumber && keyword)) {
        return false;
    }
    showStatus(`(Run for ${++times} times)`);
    if (!examType) {
        if (!await getExamType()) {
            return;
        }
    }
    const overlaySelect = document.querySelector('#overlay-select');
    if (overlaySelect) {
        overlaySelect.remove();
    }
    if (!posId) {
        const data = await httpRequest('PUT', 'web/getPosByExam', {
            "examType": examType,
            "startDate": startDate
        });
        if (data == 400 || data == 403) {
            await signIn();
            return;
        } else if (!Array.isArray(data)) {
            return;
        }
        let content = '';
        let match = [];
        data.forEach(item => {
            if (item.agency.toLowerCase().includes(officeName.toLowerCase())) {
                match.push({
                    value: item.posId,
                    label: item.agency
                });
            }
        });
        if (match.length == 0) {
            content = '<div style="color:red">No road test offices, please set officeName variable then re-run the script</div>' + content;
            clearInterval(timerId);
            showStatus('(Script stopped)');
            console.error(getDate(), 'No road test offices, please set officeName variable then re-run the script.');
            return;
        } else if (match.length == 1) {
            posId = match[0].value;
            officeName = match[0].label;
        } else {
            showSelect('Please select a road test office to continue', match, value => {
                posId = value;
                officeName = match.find(item => item.value == value).label;
                console.warn(getDate(), `You can set the variable officeName to '${officeName}' for optimization.`);
                actionSearch();
                timerId = setInterval(() => actionSearch(), 60000);
            });
            clearInterval(timerId);
            showStatus('(Script stopped)');
            console.error(getDate(), 'Please select a road test office or update the officeName variable then re-run the script.');
            return;
        }
    }
    const requestBody = {
        "aPosID": posId,
        "examType": examType,
        "examDate": startDate,
        "ignoreReserveTime": false,
        "prfDaysOfWeek": daysOfWeek,
        "prfPartsOfDay": "[0,1]",
        "lastName": lastName,
        "licenseNumber": licenceNumber
    };
    const data = await httpRequest('POST', 'web/getAvailableAppointments', requestBody);
    if (data == 400 || data == 403) {
        await signIn();
        return;
    } else if (!Array.isArray(data)) {
        return;
    }
    let content = '';
    let found = false;
    let lastDate = null;
    let matchList = [];
    data.forEach(item => {
        if (item.appointmentDt.date <= endDate) {
            if (!endTime || (item.startTm >= startTime && item.startTm <= endTime)) {
                found = true;
                matchList.push(item);
                console.warn(getDate(), 'Available: ' + item.appointmentDt.date + ' ' + item.startTm);
                if (item.appointmentDt.date != lastDate) {
                    lastDate = item.appointmentDt.date;
                    content += `<div style="color:blue;width:100%;">${item.appointmentDt.date}</div>`;
                }
                content += `<div style="width:60px;">${item.startTm}</div>`;
            }
        }
    });
    if (found) {
        const title = `Found appointments for ${officeName} [${startDate} - ${endDate}] [${startTime} - ${endTime}]`;
        showContent(title, content, 'red');
        console.warn(getDate(), title);
        playAudio();
        if (times < 3 && matchList.length > 1) {
            console.error(getDate(), 'Please modify the endDate and endTime parameters to reduce the matching data.');
        }
        if (autoLock && times > 10) {
            // The first 10 queries (within 10 minutes) will be ignored
            if (!drvrId) {
                await signIn();
            }
            // lock the middle one
            lockAppointment(matchList[Math.floor((matchList.length - 1) / 2)]);
        }
    } else {
        const title = `No matching appointments for ${officeName} in [${startDate} - ${endDate}] [${startTime} - ${endTime}]`;
        console.info(getDate(), title);
    }
}
validateParameters();
await signInPage();
actionSearch();
clearInterval(timerId);
timerId = setInterval(() => actionSearch(), 60000);
