import userIcon from '../user.svg';
import messageIcon from '../message-circle-more.svg';
import searchIcon from '../search.svg';
import sendIcon from '../send.svg';
import hourglassIcon from '../hourglass.svg';
import eyeOffIcon from '../eye-off.svg';
import eyeIcon from '../eye.svg';
import plusIcon from '../plus.svg';
import trashIcon from '../trash-2.svg';
import arrowBackIcon from '../arrow-back.svg';
import mailOpenIcon from '../mail-open.svg';
import houseIcon from '../house.svg';
import fileTextIcon from '../file-text.svg';
import downloadIcon from '../download.svg';
import listRestartIcon from '../listRestart.svg';
import rotateIcon from '../rotate-cw.svg';
import clipBoardIcon from '../clipboard-list.svg';
import checkIcon from '../check.svg';
import banIcon from '../ban.svg';

const icons = {
  user: userIcon,
  message: messageIcon,
  search: searchIcon,
  send: sendIcon,
  hourglass: hourglassIcon,
  eyeOff: eyeOffIcon,
  eye: eyeIcon,
  plus: plusIcon,
  trash: trashIcon,
  arrowBack: arrowBackIcon,
  mailOpen: mailOpenIcon,
  house: houseIcon,
  fileText: fileTextIcon,
  download: downloadIcon,
  listRestart: listRestartIcon,
  rotate: rotateIcon,
  clipBoard: clipBoardIcon,
  check: checkIcon,
  ban: banIcon,
};

export const getIcon = (name) => icons[name] || null;

// Named exports for convenience and tree-shaking
export const user = userIcon;
export const message = messageIcon;
export const search = searchIcon;
export const send = sendIcon;
export const hourglass = hourglassIcon;
export const eyeOff = eyeOffIcon;
export const eye = eyeIcon; 
export const plus = plusIcon;
export const trash = trashIcon;
export const arrowBack = arrowBackIcon;
export const mailOpen = mailOpenIcon;
export const house = houseIcon;
export const fileText = fileTextIcon;
export const download = downloadIcon;
export const listRestart = listRestartIcon;
export const rotate = rotateIcon;
export const clipBoard = clipBoardIcon;
export const check = checkIcon;
export const ban = banIcon;

export default icons;
