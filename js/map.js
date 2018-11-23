'use strict';

(function () {
  var TAIL_HEIGHT = 16;
  var DEFAULT_MAIN_PIN_X = 600;
  var DEFAULT_MAIN_PIN_Y = 375;

  var PinSize = {
    WIDTH: 65,
    HEIGHT: 65,
  };

  var DragLimit = {
    X: {
      MIN: 0,
      MAX: 1200
    },
    Y: {
      MIN: 130,
      MAX: 630
    }
  };

  var TypesMap = {
    PALACE: 'Дворец',
    FLAT: 'Квартира',
    HOUSE: 'Дом',
    BUNGALO: 'Бунгало'
  };

  var template = document.querySelector('template');
  var map = document.querySelector('.map');
  var mapPins = document.querySelector('.map__pins');
  var mapPinTemplate = template.content.querySelector('.map__pin');
  var adTemplate = template.content.querySelector('.map__card');
  var popupPhoto = template.content.querySelector('.popup__photo');
  var mapFiltersContainer = document.querySelector('.map__filters-container');
  var mapFiltersSelects = document.querySelectorAll('.map__filter');
  var mapFiltersFieldset = document.querySelector('#housing-features');
  var mainPin = document.querySelector('.map__pin--main');
  var activePage = false;

  var removePins = function () {
    var mapPinsItems = document.querySelectorAll('.map__pin:not(.map__pin--main)');
    mapPinsItems.forEach(function (it) {
      it.remove();
    });
  };

  var removeMapCard = function () {
    var mapCard = document.querySelector('.map__card');
    if (mapCard) {
      mapCard.remove();
    }
  };

  var activateFilter = function () {
    mapFiltersSelects.forEach(function (it) {
      it.disabled = false;
    });
    mapFiltersFieldset.disabled = false;
  };

  var deactivateFilter = function () {
    mapFiltersSelects.forEach(function (it) {
      it.disabled = true;
    });
    mapFiltersFieldset.disabled = true;
  };

  var onLoadSuccess = function (adData) {
    window.filter.activate(adData);
  };

  var onLoadError = function (errorMessage) {
    window.utils.renderErrorMessage(errorMessage);
  };

  var createPinMarkup = function (pinData) {
    var pinItem = mapPinTemplate.cloneNode(true);
    pinItem.querySelector('img').src = pinData.author.avatar;
    pinItem.style.left = pinData.location.x + 'px';
    pinItem.style.top = pinData.location.y + 'px';
    pinItem.querySelector('img').alt = pinData.offer.title;
    var onPinItemClick = function () {
      var mapCardRemovable = map.querySelector('.map__card');
      if (mapCardRemovable) {
        mapCardRemovable.remove();
      }
      createAd(pinData);
    };
    pinItem.addEventListener('click', onPinItemClick);
    return pinItem;
  };

  var renderPinsMarkup = function (pinsData) {
    var mapPinsFragment = document.createDocumentFragment();
    pinsData.forEach(function (it) {
      mapPinsFragment.appendChild(createPinMarkup(it));
    });
    mapPins.appendChild(mapPinsFragment);
  };

  var createFeatureFragment = function (adData) {
    var featureFragment = document.createDocumentFragment();
    adData.offer.features.forEach(function (it) {
      var featureItem = document.createElement('li');
      featureItem.className = 'popup__feature popup__feature--' + it;
      featureFragment.appendChild(featureItem);
    });
    return featureFragment;
  };

  var createPhotosFragment = function (adData) {
    var photosFragment = document.createDocumentFragment();
    adData.offer.photos.forEach(function (it) {
      var popupPhotoItem = popupPhoto.cloneNode(true);
      popupPhotoItem.src = it;
      photosFragment.appendChild(popupPhotoItem);
    });
    return photosFragment;
  };

  var createAd = function (adData) {
    var ad = adTemplate.cloneNode(true);
    ad.querySelector('.map__card img').src = adData.author.avatar;
    ad.querySelector('.popup__title').textContent = adData.offer.title;
    ad.querySelector('.popup__text--price').textContent = adData.offer.price + ' ₽/ночь';
    ad.querySelector('.popup__type').textContent = TypesMap[adData.offer.type.toUpperCase()];
    ad.querySelector('.popup__text--capacity').textContent = adData.offer.rooms + ' комнаты для ' + adData.offer.guests + ' гостей';
    ad.querySelector('.popup__text--time').textContent = 'Заезд после ' + adData.offer.checkin + ', выезд до ' + adData.offer.checkout;
    ad.querySelector('.popup__features').innerHTML = '';
    ad.querySelector('.popup__features').appendChild(createFeatureFragment(adData));
    ad.querySelector('.popup__description').textContent = adData.offer.description;
    ad.querySelector('.popup__photos').removeChild(ad.querySelector('.popup__photo'));
    ad.querySelector('.popup__photos').appendChild(createPhotosFragment(adData));
    mapFiltersContainer.insertAdjacentElement('beforebegin', ad);
    var closeAdBtn = ad.querySelector('.popup__close');
    var closeAd = function () {
      ad.remove();
      closeAdBtn.removeEventListener('click', onCloseAdBtnClick);
      document.removeEventListener('keydown', onAdEscDown);
    };
    var onCloseAdBtnClick = function () {
      closeAd();
    };
    closeAdBtn.addEventListener('click', onCloseAdBtnClick);
    var onAdEscDown = function (evt) {
      window.utils.onEscDown(evt, closeAd);
    };
    document.addEventListener('keydown', onAdEscDown);
    return ad;
  };

  var onMainPinMouseDown = function (evt) {
    evt.preventDefault();
    var startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    var onMouseMove = function (moveEvt) {
      moveEvt.preventDefault();
      var shift = {
        x: startCoords.x - moveEvt.clientX,
        y: startCoords.y - moveEvt.clientY
      };
      startCoords = {
        x: moveEvt.clientX,
        y: moveEvt.clientY
      };
      var mainPinPosition = {
        x: mainPin.offsetLeft - shift.x,
        y: mainPin.offsetTop - shift.y
      };
      var Border = {
        TOP: DragLimit.Y.MIN - mainPin.offsetHeight - TAIL_HEIGHT,
        BOTTOM: DragLimit.Y.MAX - mainPin.offsetHeight - TAIL_HEIGHT,
        LEFT: DragLimit.X.MIN,
        RIGHT: DragLimit.X.MAX - mainPin.offsetWidth
      };
      if (mainPinPosition.x >= Border.LEFT && mainPinPosition.x <= Border.RIGHT) {
        mainPin.style.left = mainPinPosition.x + 'px';
      }
      if (mainPinPosition.y >= Border.TOP && mainPinPosition.y <= Border.BOTTOM) {
        mainPin.style.top = mainPinPosition.y + 'px';
      }
      var pinTailCoords = {
        x: mainPinPosition.x + Math.ceil(PinSize.WIDTH / 2),
        y: mainPinPosition.y + PinSize.HEIGHT + TAIL_HEIGHT
      };
      window.form.setAddress(pinTailCoords);
    };

    var onMouseUp = function (upEvt) {
      upEvt.preventDefault();

      if (!activePage) {
        activateMap();
        window.form.activate();
        activePage = true;
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  var getMainPinDefaultCoords = function () {
    return {
      x: DEFAULT_MAIN_PIN_X,
      y: DEFAULT_MAIN_PIN_Y
    };
  };

  var activateMap = function () {
    window.backend.load(onLoadSuccess, onLoadError);
    map.classList.remove('map--faded');
    activateFilter();
  };

  var deactivateMap = function () {
    map.classList.add('map--faded');
    removePins();
    removeMapCard();
    mainPin.style.top = DEFAULT_MAIN_PIN_Y - PinSize.HEIGHT / 2 + 'px';
    mainPin.style.left = DEFAULT_MAIN_PIN_X - PinSize.WIDTH / 2 + 'px';
    deactivateFilter();
    activePage = false;
  };

  var initPage = function () {
    deactivateMap();
    mainPin.addEventListener('mousedown', onMainPinMouseDown);
  };

  initPage();

  window.map = {
    getMainPinDefaultCoords: getMainPinDefaultCoords,
    deactivate: deactivateMap,
    removePins: removePins,
    removeMapCard: removeMapCard,
    renderPinsMarkup: renderPinsMarkup
  };
})();
