'use strict';

(function () {
  var RoomGuestRation = {
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    100: [0]
  };

  var BuildingMinPrice = {
    BUNGALO: 0,
    FLAT: 1000,
    HOUSE: 5000,
    PALACE: 10000
  };

  var adForm = document.querySelector('.ad-form');
  var adFormFieldsets = document.querySelectorAll('.ad-form__element');
  var adFormHeader = document.querySelector('.ad-form-header');
  var addressInput = document.querySelector('#address');
  var success = document.querySelector('.success');
  var titleInput = document.querySelector('#title');
  var typeInput = document.querySelector('#type');
  var priceInput = document.querySelector('#price');
  var timeInInput = document.querySelector('#timein');
  var timeOutInput = document.querySelector('#timeout');
  var roomNumberSelect = document.querySelector('#room_number');
  var capacitySelect = document.querySelector('#capacity');
  var submitBtn = document.querySelector('.ad-form__submit');
  var resetBtn = document.querySelector('.ad-form__reset');
  var invalidElements = [];

  var setAddressCoords = function (coords) {
    addressInput.value = coords.x + ', ' + coords.y;
  };

  var onTypeInputChange = function (evt) {
    var minPrice = BuildingMinPrice[evt.target.value.toUpperCase()];
    priceInput.min = minPrice;
    priceInput.placeholder = minPrice.toString();
  };

  var onTimeInInputChange = function (evt) {
    timeOutInput.value = evt.target.value;
  };

  var onTimeOutInputChange = function (evt) {
    timeInInput.value = evt.target.value;
  };

  var disableСapacityOptions = function (inputValue) {
    var capacityOptions = capacitySelect.querySelectorAll('option');
    capacityOptions.forEach(function (it) {
      it.disabled = true;
    });
    RoomGuestRation[inputValue].forEach(function (it) {
      capacitySelect.querySelector('option' + '[value="' + it + '"]').disabled = false;
      capacitySelect.value = it;
    });
  };

  var highlightInvalidElement = function (item) {
    invalidElements.push(item);
    item.classList.add('invalid-element');
  };

  var unhighlightInvalidElement = function (item) {
    invalidElements.splice(invalidElements.indexOf(item), 1);
    item.classList.remove('invalid-element');
  };

  var onFormInvalid = function (evt) {
    highlightInvalidElement(evt.target);
  };

  var onElementCheckValidity = function (evt) {
    if (!evt.target.checkValidity()) {
      highlightInvalidElement(evt.target);
    } else if (invalidElements.indexOf(evt.target) !== 1) {
      unhighlightInvalidElement(evt.target);
    }
  };

  var checkPlaceValidity = function () {
    var roomGuests = RoomGuestRation[roomNumberSelect.value];
    var message = roomGuests.indexOf(+capacitySelect.value) === -1 ? 'Количество гостей не влезут в выбранную комнату' : '';
    capacitySelect.setCustomValidity(message);
  };

  var onRoomNumberSelectChange = function (evt) {
    evt.target.setCustomValidity('');
    disableСapacityOptions(roomNumberSelect.value);
  };

  var onCapacitySelectChange = function (evt) {
    evt.target.setCustomValidity('');
  };

  var onSubmitBtnClick = function () {
    checkPlaceValidity();
  };

  var onSuccessEscDown = function (evt) {
    window.utils.onEscDown(evt, closeSuccess);
  };

  var onSuccessClick = function () {
    closeSuccess();
  };

  var closeSuccess = function () {
    success.classList.add('hidden');
    document.removeEventListener('keydown', onSuccessEscDown);
    success.removeEventListener('click', onSuccessClick);
  };

  var showSuccess = function () {
    success.classList.remove('hidden');
    document.addEventListener('keydown', onSuccessEscDown);
    success.addEventListener('click', onSuccessClick);
  };

  var onSubmitSuccess = function () {
    showSuccess();
    deactivateForm();
    window.map.deactivate();
    window.filter.deactivate();
  };

  var onSubmitError = function (errorMessage) {
    window.utils.renderErrorMessage(errorMessage);
  };

  var onAdFormSubmit = function (evt) {
    evt.preventDefault();
    var formData = new FormData(adForm);
    window.backend.upload(onSubmitSuccess, onSubmitError, formData);
  };

  var onResetBtnClick = function (evt) {
    evt.preventDefault();
    deactivateForm();
    window.map.deactivate();
    window.filter.deactivate();
    window.loadImage.remove();
  };

  var addFormListeners = function () {
    adForm.addEventListener('invalid', onFormInvalid, true);
    priceInput.addEventListener('change', onElementCheckValidity);
    titleInput.addEventListener('change', onElementCheckValidity);
    typeInput.addEventListener('change', onTypeInputChange);
    timeInInput.addEventListener('change', onTimeInInputChange);
    timeOutInput.addEventListener('change', onTimeOutInputChange);
    roomNumberSelect.addEventListener('change', onRoomNumberSelectChange);
    capacitySelect.addEventListener('change', onCapacitySelectChange);
    submitBtn.addEventListener('click', onSubmitBtnClick);
    adForm.addEventListener('submit', onAdFormSubmit);
    resetBtn.addEventListener('click', onResetBtnClick);
  };

  var removeFormListeners = function () {
    adForm.removeEventListener('invalid', onFormInvalid, true);
    priceInput.removeEventListener('change', onElementCheckValidity);
    titleInput.removeEventListener('change', onElementCheckValidity);
    typeInput.removeEventListener('change', onTypeInputChange);
    timeInInput.removeEventListener('change', onTimeInInputChange);
    timeOutInput.removeEventListener('change', onTimeOutInputChange);
    roomNumberSelect.removeEventListener('change', onRoomNumberSelectChange);
    capacitySelect.removeEventListener('change', onCapacitySelectChange);
    submitBtn.removeEventListener('click', onSubmitBtnClick);
    adForm.removeEventListener('submit', onAdFormSubmit);
    resetBtn.removeEventListener('click', onResetBtnClick);
  };

  var activateForm = function () {
    adForm.classList.remove('ad-form--disabled');
    adFormFieldsets.forEach(function (it) {
      it.disabled = false;
    });
    adFormHeader.disabled = false;
    window.loadImage.activate();
    addFormListeners();
  };

  var deactivateForm = function () {
    adForm.reset();
    adFormFieldsets.forEach(function (it) {
      it.disabled = true;
    });
    adFormHeader.disabled = true;
    adForm.classList.add('ad-form--disabled');
    window.loadImage.deactivate();
    window.loadImage.remove();
    setAddressCoords(window.map.getMainPinDefaultCoords());
    removeFormListeners();
  };

  deactivateForm();

  window.form = {
    setAddress: setAddressCoords,
    activate: activateForm
  };
})();
