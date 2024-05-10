import { CheckIcon, XIcon } from './icons'; // assuming SuccessIcon is in a separate file

export function getIconResult(value: boolean | null) {
    if(value){
        return (
            <CheckIcon />
        )
    }
    else{
        return (
            <XIcon />
        )
    }
}
