(() => {
    const userSettingBtn = document.querySelector('span.user-settings');
    const userSettingsContainer = document.querySelector('.user-settings-container');
    const btnChangePassword = document.querySelector('.btn-change-password');
    const btnChangeEmail = document.querySelector('.btn-change-email');
    const btnChangePhone = document.querySelector('.btn-change-phone');
    const changePassword = document.querySelector('.change-data-password');
    const changeEmail = document.querySelector('.change-data-email');
    const changePhone = document.querySelector('.change-data-phone');
    const btnSubmitChangePassword = document.querySelector('.btn-change-password-apply');
    const btnSubmitChangeEmail = document.querySelector('.btn-change-email-apply');
    const btnSubmitChangePhone = document.querySelector('.btn-change-phone-apply');
    let actualPassword, actualPasswordEmail, actualPasswordPhone, newPassword, newEmail, newPhone;

    userSettingBtn.addEventListener('click', () => userSettingsContainer.style.display = 'flex');

    btnChangePassword.addEventListener('click', () => changePassword.style.display = 'flex');

    btnChangeEmail.addEventListener('click', () => changeEmail.style.display = 'flex');

    btnChangePhone.addEventListener('click', () => changePhone.style.display = 'flex');

    document.querySelector('.user-settings-container__close').addEventListener('click', () => userSettingsContainer.style.display = 'none');

    document.querySelector('.change-data-password__close').addEventListener('click', () => changePassword.style.display = 'none');

    document.querySelector('.change-data-email__close').addEventListener('click', () => changeEmail.style.display = 'none');

    document.querySelector('.change-data-phone__close').addEventListener('click', () => changePhone.style.display = 'none');

    async function changeData(containerClass, what, password, newData) {
        if (password.length === 0) {
            document.querySelector(`.${containerClass}`).innerHTML = 'Podaj hasło';
            return
        }
        const response = await fetch(`${window.location.href}/change-user-data/${what}/${password}/${newData}`);
        const msgToClient = await response.text();
        document.querySelector(`.${containerClass}`).innerHTML = msgToClient;
    };
    btnSubmitChangePassword.addEventListener('click', () => {
        actualPassword = document.querySelector('#actualPassword').value;
        newPassword = document.querySelector('#newPassword').value;
        changeData('change-data-password__response', 'password', actualPassword, newPassword)
    });

    btnSubmitChangeEmail.addEventListener('click', () => {
        actualPassword = document.querySelector('#actualPasswordEmail').value;
        newEmail = document.querySelector('#newEmail').value;
        changeData('change-data-email__response', 'mail', actualPassword, newEmail)
    });

    btnSubmitChangePhone.addEventListener('click', () => {
        actualPassword = document.querySelector('#actualPasswordPhone').value;
        newPhone = document.querySelector('#newPhone').value;
        changeData('change-data-phone__response', 'phone', actualPassword, newPhone)
    });

})()