
export const GeneralErrType = {
  unknown: 'unknown',
}

export const AuthErrType = {
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  userNotFound: 'userNotFound',
  usernameExist: 'usernameExist',
}

export const CreditErrType = {
  creditNotEnough: 'creditNotEnough',
  orderDisallowCancel: 'orderDisallowCancel',
}

const ERROR_CODE = {
  [GeneralErrType.unknown]: 10001,

  [AuthErrType.unauthorized]: 20001,
  [AuthErrType.forbidden]: 20002,
  [AuthErrType.userNotFound]: 20003,
  [AuthErrType.usernameExist]: 20004,

  [CreditErrType.creditNotEnough]: 30001,
  [CreditErrType.orderDisallowCancel]: 30002
}

export default ERROR_CODE
