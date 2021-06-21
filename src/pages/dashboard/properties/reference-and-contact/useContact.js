import { useState, useMemo, useCallback } from 'react';
import { contactInfoValidator } from '~helpers/property-edit';

const newContact = { contactName: '', contactPhone: '', contactEmail: '', occupation: '' };
const newContactValidate = {
  contactNameNotEmpty: true,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  occupation: true,
};

const useContact = ({ value, onBlur }) => {
  const initContacts = useMemo(() => {
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
    return [{ ...newContact }];
  }, [value]);

  const initContactValidate = useMemo(
    () => initContacts.map(() => ({ ...newContactValidate })),
    [initContacts],
  );

  const [contacts, setContacts] = useState(initContacts);
  const [contactValidate, setContactValidate] = useState(initContactValidate);

  const checkContacts = useCallback((newContacts) => {
    const { validate } = contactInfoValidator(newContacts);
    setContactValidate(validate);
    onBlur(newContacts);
  }, []);

  const setContactWithCheck = (newContacts) => {
    setContacts(newContacts);
    checkContacts(newContacts);
  };

  const addContact = () => {
    const addedContacts = [...contacts, { ...newContact }];
    setContactWithCheck(addedContacts);
  };

  const deleteContact = (index) => {
    const deletedContacts = [...contacts];
    deletedContacts.splice(index, 1);
    setContactWithCheck(deletedContacts);
  };

  const handleContactChagne = (index, fieldName, fieldValue) => {
    const changedContacts = [...contacts];
    changedContacts[index][fieldName] = fieldValue;
    setContacts(changedContacts);
  };

  const handleCheckContacts = useCallback(() => {
    checkContacts(contacts);
  }, [contacts]);

  return {
    contacts,
    contactValidate,
    addContact,
    deleteContact,
    handleContactChagne,
    handleCheckContacts,
  };
};

export default useContact;
