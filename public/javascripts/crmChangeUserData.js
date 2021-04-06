(() => {
    const userSettingBtn = document.querySelector('span.user-settings');
    const userSettingsContainer = document.querySelector('.user-settings-container');
    const btnChangePassword = document.querySelector('.btn-change-password');
    const changePassword = document.querySelector('.change-data-password');
    const btnSubmitChangePassword = document.querySelector('.btn-change-password-apply');
    let actualPassword, newPassword;
    userSettingBtn.addEventListener('click', () => userSettingsContainer.style.display = 'flex');
    btnChangePassword.addEventListener('click', () => changePassword.style.display = 'flex');
    document.querySelector('.user-settings-container__close').addEventListener('click', () => userSettingsContainer.style.display = 'none');
    document.querySelector('.change-data-password__close').addEventListener('click', () => changePassword.style.display = 'none');

    async function changeData(containerClass, what, password, newData) {
        if (password.length === 0 || newData.length === 0) {
            document.querySelector(`.${containerClass}`).innerHTML = 'Podaj dane';
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

})()