const regex = {
  email: /^([a-z0-9_.+-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/,
  validChar: /^[a-zA-Z\s]*$/,
  password:
    /^(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+{}[\]|\\;:'",.<>/?`~])(?=.*[A-Z])(?=.*[a-z]).*$/,
};

export function lengthRangeCheck(
  value: string | any,
  min: number,
  max: number,
) {
  return value.length >= min && value.length <= max;
}

export function validateName(
  name: string,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (!lengthRangeCheck(name, 2, 50)) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please ensure your name is between 2 and 50 characters.",
    }));
  } else if (!regex.validChar.test(name)) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please enter a valid name.",
    }));
  }
  return true;
}

export function validateEmail(
  email: string,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (!lengthRangeCheck(email, 3, 100)) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please ensure your email is between 3 and 100 characters.",
    }));
  }
  if (!regex.email.test(email)) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please enter a valid email.",
    }));
  }
  return true;
}

export function validatePhone(
  phone: string,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (phone && !lengthRangeCheck(phone, 10, 10)) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please enter a 10 digit phone number.",
    }));
  }
  return true;
}

export function validatePassword(
  password: string,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (!lengthRangeCheck(password, 8, 50)) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]:
        "Please ensure your password is between 8 and 50 characters.",
    }));
  } else if (!regex.password.test(password)) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]:
        "Please ensure your password contains at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }));
  }
  return true;
}

export function validateLocation(
  location: string,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (!location.trim()) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please enter your location.",
    }));
  }
  return true;
}

export function validateBio(
  bio: string,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (!bio.trim()) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please enter your bio.",
    }));
  }
  return true;
}

export function validatePreferredName(
  preferredName: string,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (preferredName.trim().length > 100) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Preferred name must be 100 characters or fewer.",
    }));
  }
  return true;
}

export function validateTraits(
  traits: string[],
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (traits.length === 0) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please select at least one trait.",
    }));
  }
  return true;
}

export function validateGoals(
  goals: string[],
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (goals.length === 0) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Please select at least one goal.",
    }));
  }
  return true;
}

export function validatePreferredDistance(
  preferredDist: number,
  setFieldErrors: (value: (currentErrors: any) => any) => void,
  fieldName: string,
) {
  if (isNaN(preferredDist) || preferredDist < 0) {
    return setFieldErrors((currentErrors: any) => ({
      ...currentErrors,
      [fieldName]: "Preferred distance must be a non-negative number.",
    }));
  }
  return true;
}