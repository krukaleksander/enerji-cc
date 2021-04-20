(() => {
    const newClientContainer = document.querySelector('.particular-client-new');
    const closeNewContainer = document.querySelector('.particular-client-new__close');
    const openNewContainer = document.querySelector('.add-client-icon__icon');
    const cancelBtn = document.querySelector('.particular-client-new__btn-cancel');
    const addClientBtn = document.querySelector('.particular-client-new__btn-update');

    openNewContainer.addEventListener('click', () => {
        zeroValues();
        newClientContainer.style.display = 'flex'
    });
    closeNewContainer.addEventListener('click', () => newClientContainer.style.display = 'none');
    cancelBtn.addEventListener('click', () => newClientContainer.style.display = 'none');

    let idPar, namePar, ownerPar, phonePar, emailPar, consumptionPar, categoryPar, postalCodePar, cityPar, streetPar, streetNumberPar, descriptionPar, selectStatus;

    function getActualValues() {
        idPar = document.querySelector('.particular-client-new__id').value;
        namePar = document.querySelector('.particular-client-new__name').value;
        ownerPar = document.querySelector('.particular-client-new__owner').value;
        phonePar = document.querySelector('.particular-client-new__phone').value;
        emailPar = document.querySelector('.particular-client-new__email').value;
        consumptionPar = document.querySelector('.particular-client-new__consumption').value;
        categoryPar = document.querySelector('.particular-client-new__category').value;
        postalCodePar = document.querySelector('.particular-client-new__postal-code').value;
        cityPar = document.querySelector('.particular-client-new__city').value;
        streetPar = document.querySelector('.particular-client-new__street').value;
        streetNumberPar = document.querySelector('.particular-client-new__street-number').value;
        descriptionPar = document.querySelector('.particular-client-new__description').value;
        selectStatus = document.querySelector('.particular-client-new__select-status').value;
    }

    function zeroValues() {
        document.querySelector('.particular-client-new__id').value = '';
        document.querySelector('.particular-client-new__name').value = '';
        document.querySelector('.particular-client-new__owner').value = 'default';
        document.querySelector('.particular-client-new__phone').value = '';
        document.querySelector('.particular-client-new__email').value = '';
        document.querySelector('.particular-client-new__consumption').value = '';
        document.querySelector('.particular-client-new__category').value = 'country';
        document.querySelector('.particular-client-new__postal-code').value = '';
        document.querySelector('.particular-client-new__city').value = '';
        document.querySelector('.particular-client-new__street').value = '';
        document.querySelector('.particular-client-new__street-number').value = '';
        document.querySelector('.particular-client-new__description').value = '';
        document.querySelector('.particular-client-new__select-status').value = 'potencjalny';
    }

    addClientBtn.addEventListener('click', (e) => {
        e.preventDefault();
        getActualValues();
        let data = new URLSearchParams();
        data.append("id", idPar);
        data.append("name", namePar);
        data.append("owner", ownerPar);
        data.append("phone", phonePar);
        data.append("email", emailPar);
        data.append("consumption", consumptionPar);
        data.append("category", categoryPar);
        data.append("postalCode", postalCodePar);
        data.append("city", cityPar);
        data.append("street", streetPar);
        data.append("streetNumber", streetNumberPar);
        data.append("description", descriptionPar);
        data.append("status", selectStatus);

        fetch(`${window.location.href}/add-client/`, {
                method: 'post',
                body: data
            })
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                const updateInfoContainer = document.querySelector('.particular-client-new__add-info');
                updateInfoContainer.innerHTML = text;
                updateInfoContainer.style.display = 'block';
                setTimeout(() => updateInfoContainer.style.display = 'none', 1500)
            })
            .catch(function (error) {
                console.log(error)
            });



    })

})()