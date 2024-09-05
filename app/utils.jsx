// Generate the current date in form of a string
export function generateDate() {
    let currentDate = new Date();
    return `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
}

// Get a date object from a chat
export function getChatDate(chat) {
    let dateString = chat.date;
    if (chat.messages.length > 0)
        dateString = chat.messages[chat.messages.length - 1].date;
    let dateOnly = dateString.split(" ")[0];
    let timeOnly = dateString.split(" ")[1];
    let year = dateOnly.split("-")[0];
    let month = dateOnly.split("-")[1];
    let day = dateOnly.split("-")[2];
    let hour = timeOnly.split(":")[0];
    let minutes = timeOnly.split(":")[1];
    let seconds = timeOnly.split(":")[2];
    return new Date(year, month, day, hour, minutes, seconds);
}

export function sortChatsFromDates(chats) {
    if (chats.length <= 1) return chats;

    let pivot = getChatDate(chats[0]);
    let left = [];
    let right = [];

    for (let i = 1; i < chats.length; i++) {
        let date = getChatDate(chats[i]);
        if (date < pivot) {
            left.push(chats[i]);
        } else {
            right.push(chats[i]);
        }
    }

    return [...sortChatsFromDates(left), chats[0], ...sortChatsFromDates(right)];
}

export function stringToBool(str) {
    return str.toLowerCase() === 'true';
}