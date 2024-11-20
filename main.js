// Modify the following 6 variables with your own information, open the ICBC road test appointment website https://onlinebusiness.icbc.com/webdeas-ui/home
// Then press the F12 key to open the debugger and switch to the Console tab. Copy the entire code below and paste it into the Console tab, then press Enter to execute it.
// If there are no errors, the code will execute once every 2 minutes. When a matching date range for available test slots is found, a sound reminder will play (please adjust your computer's volume).
// Make sure the current page of the browser is not minimized. It is recommended to set the computer not to automatically lock the screen.

const drvrLastName = 'li'; // Driver's last name
const licenceNumber = '09900000'; // Driver's license number
const keyword = 'wong'; // Typically the mother's last name
const officeName = 'Kingsway' // Test center name, such as Kingsway, Richmond claim centre, can be found in the "By office" dropdown menu on the appointment page
const startDate = '2024-11-20' // Earliest date
const endDate = '' // Latest date, e.g., 2024-12-20. Leave empty to indicate one month later

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDate() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function isDateInRange(dateStr) {
    const cleanedStr = dateStr.replace(/,|st|nd|rd|th/g, '');
    const date = new Date(cleanedStr);
    if (isNaN(date)) {
        throw new Error('Invalid date format');
    }
    const currentDate = new Date();
    const rangeStart = startDate ? new Date(startDate) : currentDate;
    const rangeEnd = endDate ? new Date(endDate) : currentDate.setMonth(currentDate.getMonth() - 1);
    return date >= rangeStart && date <= rangeEnd;
}

let timerId = 0;
async function actionSearch() {
    const searchForm = document.forms['searchForm'];
    if (!searchForm) {
        // No search button, need to log in
        let nextButton = document.querySelector('button.primary');
        nextButton.click();
        await delay(3000);
        console.info(getDate(), 'Logging into the system')
        let input = document.querySelector('input[formcontrolname="drvrLastName"]');
        input.value = drvrLastName;
        input.dispatchEvent(new Event('input'));
        input = document.querySelector('input[formcontrolname="licenceNumber"]');
        input.value = licenceNumber;
        input.dispatchEvent(new Event('input'));
        input = document.querySelector('input[formcontrolname="keyword"]');
        input.value = keyword;
        input.dispatchEvent(new Event('input'));
        const checkbox = document.getElementsByClassName('mat-checkbox-layout')[0];
        const parentCheckbox = checkbox.closest('.mat-checkbox');
        const isChecked = parentCheckbox.classList.contains('mat-checkbox-checked');
        if (!isChecked) {
            checkbox.click();
        }
        document.querySelector('button[type="submit"]').click(); // Log in
        await delay(5000);
        if (document.body.innerText.includes('Sign in')) {
			clearInterval(timerId);
            console.error(getDate(), 'Failed to login, script stopped');
            return
        }
        document.getElementById('search-location').querySelectorAll('div[role="tab"]')[1].click() // Click the 【By office】 tab
        // Simulate sending an event to get the test center list
        input = document.querySelector('input[formcontrolname="officeControl"]');
        input.focus();
        input.value = 'vancouver';
        input.dispatchEvent(new Event('input', {
                bubbles: true
            }));
        input.dispatchEvent(new Event('change', {
                bubbles: true
            }));
        input.dispatchEvent(new KeyboardEvent('keyup', {
                key: 'r',
                bubbles: true,
                cancelable: true
            }));
        await delay(5000);
        const options = document.querySelectorAll('mat-option');
        if (options.length == 0) {
            clearInterval(timerId);
			console.error(getDate(), 'No office found, script stopped');
            return
        }
        // Iterate through each option, looking for the office
        let found = false;
        options.forEach(option => {
            const optionText = option.querySelector('.mat-option-text');
            if (optionText && optionText.textContent.includes(officeName)) {
                option.click();
                found = true;
            }
        });
        if (!found) {
			clearInterval(timerId);
            console.error(getDate(), 'No office found with name containing [' + officeName + '], script stopped')
            return
        }
    } else {
        const searchButton = searchForm.querySelector('button');
        searchButton.click();
    }
    await delay(3000);
    const viewMore = document.getElementsByClassName('view-more-btn');
    if (viewMore.length > 0) {
        viewMore[0].click();
    }
    const list = document.getElementsByClassName('appointment-listings');
    if (list.length == 0) {
		console.warn(getDate(), 'Appointments not found, the session may have expired')
        const signOut = document.getElementsByClassName("sign-out-button");
        if (signOut.length > 0) {
			console.info(getDate(), 'Logout of the system')
            signOut[0].click();
		}
        return;
    }
    let found = false;
    const dates = list[0].querySelectorAll('.date-title');
    dates.forEach(date => {
        if (isDateInRange(date.innerText)) {
            found = true;
            console.warn(getDate(), 'Available date: ' + date.innerText)
        }
    });
    if (found) {
        const audio = new Audio('https://www.soundjay.com/phone/telephone-ring-03a.wav'); // Play sound when a match is found
        audio.play();
    } else {
        console.log(getDate(), 'No matching date')
    }
}
actionSearch();
timerId = setInterval(() => actionSearch(), 120000);
