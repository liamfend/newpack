

export const fireElementCustomEvent = (element, eventName, data = null) => {
  let event = null;

  if (data) {
    event = new CustomEvent(eventName, {
      detail: data,
    });
  } else {
    event = document.createEvent('Event');
    event.initEvent(eventName, true, false);
  }

  element.dispatchEvent(event);
};

export const fireCustomEvent = (eventName, data = null) => {
  fireElementCustomEvent(document, eventName, data);
};
