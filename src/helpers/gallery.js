import endpoints from '~settings/endpoints';
import gallery, { localeMapping } from '~constants/gallery';
import { updateMutation } from '~client/constants';
import { cloneObject } from '~helpers';

/**
 * Convert size in bytes to KB, MB, GB..
 *
 * @param {Number} bytes
 * @param {Number} decimals
 * @returns {String} the size with unit such as 1024KB, 1MB
 */
export function formatBytes(bytes, decimals = 0) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / (k ** i)).toFixed(dm)) + sizes[i];
}

/**
 * Get file info
 *
 * @param {File} file
 * @returns {Promise}
 */
export function getFileInfo(file) {
  const type = getFileType(file.type);
  const randomID = Math.random().toString().replace('0.', '');
  const info = {
    uuid: `${type}-${randomID}`,
    url: URL.createObjectURL(file),
    file,
    contentType: file.type,
    size: file.size,
  };
  return new Promise((resolve, reject) => {
    if (type === 'image') {
      const img = new Image();
      img.onload = () => {
        info.width = img.width;
        info.height = img.height;
        resolve(info);
      };
      img.onerror = (...args) => {
        reject(args);
      };
      img.src = info.url;
    }
    if (type === 'video') {
      const video = document.createElement('video');
      video.onloadeddata = () => {
        info.width = video.width;
        info.height = video.height;
        resolve(info);
      };
      video.onerror = (...args) => {
        reject(args);
      };
      video.src = info.url;
    }
  });
}

/**
 * Get file type
 *
 * @param {String} mediaType
 * @returns {String}
 */
export function getFileType(mediaType) {
  if (mediaType) {
    return mediaType.split('/')[0];
  }
  return '';
}

/**
 * Build image url
 *
 * @param {Object} image the image item of Graph API
 * @param {Object} options width/height/type
 * @return {String} the url of image
 */
export function imageUrl(image, options) {
  if (image.url) {
    return image.url;
  }

  if (image && image.source) {
    return endpoints.image.url(`${image.source}`, options);
  }

  return endpoints.image.url(`${image.filename}-${image.imageHash}.${image.extension}`, options);
}

export function formatLibraries(rooms, links) {
  const libraries = {
    photo: null,
    property: [],
    rooms: [],
  };
  libraries.photo = {
    ...gallery.libraries.photo,
    id: `property:${gallery.libraries.photo.category.toLowerCase()}`,
  };
  libraries.property = gallery.libraries.property.map(library => ({
    ...library,
    id: `property:${library.category.toLowerCase()}`,
    links: (links && links.filter(linkItem => linkItem.area === library.category)) || [],
  }));
  libraries.rooms = formatRoomLibraries(rooms);
  return libraries;
}

export function formatRoomLibraries(rooms) {
  if (rooms && rooms.length > 0) {
    const formatedRooms = rooms
      .filter(room => room.node.action !== updateMutation.DELETE)
      .map((room) => {
        const formatRoom = {
          ...gallery.libraries.room,
          id: `room:${room.node.id}`,
          name: room.node.name,
          listings: room.node.listings,
          action: room.node.action,
          links: room.node.links,
        };
        // delete formatRoom.drapzoneTransKey;
        return formatRoom;
      });
    if (formatedRooms.length > 0) {
      formatedRooms.unshift({
        ...gallery.libraries.undefined_room,
        id: `property:${gallery.libraries.undefined_room.category.toLowerCase()}`,
      });
    }
    return formatedRooms;
  }
  return [];
}

export function librariesAsArr(libraries) {
  return [libraries.photo].concat(libraries.property, libraries.rooms);
}

const formatVideos = (videos) => {
  const formatedVideos = videos.map(video => ({
    id: video.id,
    position: Number(video.position),
    category: video.category,
    locales: video.locales || localeMapping.ALL,
  }));

  return formatedVideos;
};

const sortImages = images => (
  images.slice(0).sort((v1, v2) => (
    (v1.node.position === null ? 9999 : v1.node.position) -
    (v2.node.position === null ? 9999 : v2.node.position)
  ))
);

const sortVideos = videos => (
  videos.slice(0).sort((v1, v2) => (
    (v1.position === null ? 9999 : v1.position) - (v2.position === null ? 9999 : v2.position)
  ))
);

export function formatList(libraries, property) {
  const list = {};
  librariesAsArr(libraries).forEach((library) => {
    if (!list[library.id]) {
      list[library.id] = [];
    }
  });
  sortImages(property.allImages.edges).forEach((edge) => {
    let id;
    if (edge.node.hero) {
      id = 'property:cover_photo';
    } else if (edge.node.category) {
      id = `property:${edge.node.category.toLowerCase()}`;
    } else {
      id = 'property:general';
    }
    if (list[id]) {
      list[id].push(edge.node);
    }
  });
  sortVideos(property.allVideos).forEach((video) => {
    let id;
    if (video.category) {
      id = `property:${video.category.toLowerCase()}`;
    } else {
      id = 'property:general';
    }
    if (list[id]) {
      list[id].push(Object.assign(video, {
        contentType: 'video/mp4',
      }));
    }
  });
  if (property.unitTypes.edges.length > 0) {
    property.unitTypes.edges.forEach((room) => {
      if (room.node.allImages && room.node.allImages.edges.length > 0) {
        const id = `room:${room.node.id}`;
        if (!list[id]) {
          list[id] = [];
        }
        list[id] = list[id].concat(sortImages(room.node.allImages.edges).map(image => image.node));
      }
      if (room.node.allVideos && room.node.allVideos.length > 0) {
        const id = `room:${room.node.id}`;
        if (!list[id]) {
          list[id] = [];
        }
        list[id] = list[id].concat(sortVideos(room.node.allVideos)
          .map(video => Object.assign(video, {
            contentType: 'video/mp4',
          })));
      }
    });
  }
  return list;
}

export function updateList(mediaList, rooms) {
  const list = mediaList;
  let updated = false;
  const remove = (id) => {
    if (list[id]) {
      updated = true;
      delete list[id];
    }
  };
  const add = (id, medias) => {
    updated = true;
    if (!list[id]) {
      list[id] = [];
    }
    list[id] = list[id].concat(medias);
  };
  rooms.forEach((room) => {
    const id = `room:${room.node.id}`;
    if (room.node.action === updateMutation.DELETE) {
      remove(id);
    } else if (!list[id]) {
      add(id, []);
      if (room.node.images && room.node.images.edges.length > 0) {
        add(
          id,
          sortImages(room.node.images.edges).map(image => image.node),
        );
      }
      if (room.node.videos && room.node.videos.length > 0) {
        add(
          id,
          sortVideos(room.node.videos).map(video => Object.assign(video, {
            contentType: 'video/mp4',
          })),
        );
      }
    }
  });
  // remove images if didn't found room id in existing rooms
  Object.keys(list).forEach((id) => {
    const [libraryType] = id.split(':');
    if (libraryType === 'room' && !rooms.find(room => id === `room:${room.node.id}`)) {
      remove(id);
    }
  });
  // handle undefined room
  const undefinedRoomID = `property:${gallery.libraries.undefined_room.category.toLowerCase()}`;
  const activeRoomsCount = rooms.filter(room => room.node.action !== updateMutation.DELETE).length;
  if (activeRoomsCount === 0) {
    remove(undefinedRoomID);
  } else if (!list[undefinedRoomID]) {
    add(undefinedRoomID, []);
  }
  return { list, updated };
}

const handleUpdateItem = (items, originalItem, newItem, finalItem, actionKey, type) => {
  if (getFileType(originalItem.contentType) === 'video') {
    let removeVideoIndex;
    items[`${type}s`].find((video, index) => {
      if (video.id === finalItem.id) {
        removeVideoIndex = index;
        return true;
      }
      return false;
    });
    if (newItem[actionKey] === updateMutation.DELETE) {
      items[`${type}s`].splice(removeVideoIndex, 1);
    } else if (typeof removeVideoIndex !== 'undefined') {
      items[`${type}s`].splice(removeVideoIndex, 1, finalItem);
    } else {
      items[`${type}s`].push(finalItem);
    }
  } else {
    items[`${type}s`].push(finalItem);
  }
};

export const formatUpdateParamOfGallery = (propertyID, changedFields, property, params) => {
  const actionKey = '_action';

  const galleryParams = {
    images: [],
    videos: formatVideos(property.videos),
    unitTypes: params.unitTypes ? cloneObject(params.unitTypes) : [],
  };
  if (!changedFields.gallery || !changedFields.gallery.data ||
    !(changedFields.gallery.data && changedFields.gallery.data.value)) {
    return galleryParams;
  }
  const { list } = changedFields.gallery.data.value;
  const originalList = formatList(
    formatLibraries(property.unitTypes.edges, property.links),
    property,
  );

  const pushParam = (libraryID, originalItem, newItem) => {
    const type = getFileType(originalItem.contentType);
    const [libraryType, libraryCategory] = libraryID.split(':');
    let template;
    let finalItem;
    if (type === 'video') {
      template = {
        id: originalItem.id,
        locales: originalItem.locales || localeMapping.ALL,
      };
    } else {
      template = {
        filename: originalItem.filename,
        extension: originalItem.extension,
        contentType: originalItem.contentType,
        width: originalItem.width,
        height: originalItem.height,
        size: originalItem.size,
        imageHash: originalItem.imageHash,
      };
    }
    Object.assign(newItem, template);
    if (type === 'video') {
      finalItem = {
        id: newItem.id,
        locales: newItem.locales,
      };
      if (typeof newItem.position !== 'undefined' && newItem.position !== null) {
        finalItem.position = Number(newItem.position);
      } else {
        finalItem.position = Number(originalItem.position);
      }
    } else {
      finalItem = newItem;
    }

    if (libraryType === 'room') {
      let updateRoom = galleryParams.unitTypes.find(unit => unit.id === libraryCategory);
      if (!updateRoom) {
        const room = property.unitTypes.edges.find(unit => unit.node.id === libraryCategory);
        if (!room) {
          return;
        }
        updateRoom = {
          id: room.node.id,
          name: room.node.name,
          category: room.node.category,
          RoomArrangement: room.node.RoomArrangement,
          roomSize: room.node.roomSize,
          roomType: room.node.roomType,
          floors: room.node.floors,
          viewType: room.node.viewType,
          bedCount: room.node.bedCount,
          bedSizeType: room.node.bedSizeType,
          maxOccupancy: room.node.maxOccupancy,
          dualOccupancy: room.node.dualOccupancy,
          bathroomType: room.node.bathroomType,
          kitchenArrangement: room.node.kitchenArrangement,
          lastFurnished: room.node.lastFurnished,
          roomArrangement: room.node.roomArrangement,
          bedroomCountMin: room.node.bedroomCountMin,
          bedroomCountMax: room.node.bedroomCountMax,
          bathroomCount: room.node.bathroomCount,
          kitchenCount: room.node.kitchenCount,
          genderMix: room.node.genderMix,
          dietaryPreference: room.node.dietaryPreference,
          smokingPreference: room.node.smokingPreference,
          unitTypeBedSizes: [],
          facilities: [],
          listings: [],
          images: [],
          videos: formatVideos(room.node.videos),
          [actionKey]: updateMutation.UPDATE,
        };
        galleryParams.unitTypes.push(updateRoom);
      }
      if (!updateRoom.images) {
        updateRoom.images = [];
      }

      if (!updateRoom.videos) {
        updateRoom.videos = [];
      }
      handleUpdateItem(updateRoom, originalItem, newItem, finalItem, actionKey, type);
    } else {
      const category = libraryType === 'room' ? 'ROOM' : libraryCategory.toUpperCase();
      Object.assign(finalItem, {
        category: libraryCategory === 'cover_photo' ? 'GENERAL' : category,
      });
      handleUpdateItem(galleryParams, originalItem, newItem, finalItem, actionKey, type);
    }
  };

  const pushUpdate = (index, libraryID, item, updatePosition = null) => {
    const [libraryType, libraryCategory] = libraryID.split(':');
    const newItem = {
      hero: libraryCategory === 'cover_photo' || (libraryType === 'room' && index === 0),
    };
    if (item.id) {
      newItem.id = item.id;
      newItem[actionKey] = updateMutation.UPDATE;
    } else {
      newItem[actionKey] = updateMutation.INSERT;
    }
    if (updatePosition !== null) {
      newItem.position = Number(updatePosition);
    }
    pushParam(libraryID, item, newItem);
  };

  // Check for update and insert
  const listIDMapping = {};
  Object.keys(list).forEach((libraryID) => {
    let updatePosition = null;
    list[libraryID].forEach((item, i) => {
      if (item.id) {
        listIDMapping[item.id] = item;
      }
      if (updatePosition !== null) {
        updatePosition += 1;
        pushUpdate(i, libraryID, item, updatePosition);
        return;
      }
      const originalItem = originalList[libraryID] && originalList[libraryID][i];
      if (!originalItem || originalItem.id !== item.id ||
        (getFileType(originalItem.contentType) === 'video' && (originalItem.locales !== item.locales))) {
        if (updatePosition === null) {
          const lastItem = list[libraryID][i - 1];
          updatePosition = lastItem && lastItem.position !== null ?
            Number(lastItem.position) + 1 : 0;
        }
        pushUpdate(i, libraryID, item, updatePosition);
      }
    });
  });

  // Check for delete
  Object.keys(originalList).forEach((libraryID) => {
    originalList[libraryID].forEach((item) => {
      if (!listIDMapping[item.id]) {
        pushParam(libraryID, item, {
          id: item.id,
          hero: false,
          [actionKey]: updateMutation.DELETE,
        });
      }
    });
  });

  return galleryParams;
};

export const getLocale = (locales) => {
  if (locales) {
    if (locales.indexOf('zh-cn') !== -1 && locales.indexOf('en-us') !== -1) {
      return 'ALL';
    }
    if (locales.indexOf('zh-cn') !== -1) {
      return 'CN';
    }
    return 'ROW';
  }

  return 'ALL';
};
