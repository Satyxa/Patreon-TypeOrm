export const PASS_REC_MESSAGE = (recoveryCode) => `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href=https://somesite.com/password-recovery?recoveryCode=${recoveryCode}>recovery password</a>
      </p>`

export const EMAIL_CONF_SEND_MESSAGE = (newCode) => `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${newCode}>complete registration</a>
    </p>`

export const EMAIL_CONF_MESSAGE = (confirmationCode) => `<h1>Thank for your registration</h1>
    <p>To finish registration please follow the link below:
        <a href=https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
    </p>`

export const deleted = false