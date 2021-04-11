/*
authSms = () => {
    const phoneNumber = { "phoneNumber": document.auth_form.phone_number.value }

    if (!document.auth_form.phone_number.value) {
        return alert('휴대전화번호를 입력하세요')
    }
    fetch('/', {
        method: 'post',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(phoneNumber)
    }).then(function (response) {
        console.log(response)
        return response.text()
    }).then(function (result) {
        console.log(result)
        const vaildTime = result
     
        
    })
}

authNumber = () => {
    const formData = new FormData(document.getElementById('auth_form'))
    const phoneNumber = document.auth_form.phone_number.value
    const authNumber = document.auth_form.auth_number.value

    if (formData.has('phoneNumber')) {
        formData.delete('phoneNumber')
    }
    if (formData.has('authNumber')) {
        formData.delete('authNumber')
    }
    formData.append('phoneNumber', phoneNumber)
    formData.append('authNumber', authNumber)

    
    fetch('/verify', {
        method: 'post',
        body: formData
    }).then(function (response) {
        console.log(response)
        return response.text()
    }).then(function (result) {
        console.log(result)
        document.auth_form.auth_number.value = ''

        if (result == "<h1>Time out</h1>") {
            return alert('유효시간이 초과되었습니다. 다시 시도해주세요.')
        } else if (result == '<h1>Bad Request</h1>') {
            return alert('인증번호가 일치하지 않습니다.')
        } else if (result == "인증완료") {
            document.auth_form.phone_number.value = ''
            const element = document.getElementById('viewtimer')
            const div = document.getElementById('timer')
            element.removeChild(div)

            return alert('인증이 완료되었습니다.')
        }

    })
}
*/
countdown = (vaildTime) => {
    let endTime, secs, mins, msLeft, time, div
    twoDigits = (n) => { return (n <= 9 ? "0" + n : n) }
    updateTimer = () => {
        msLeft = endTime - (+new Date)
        if (msLeft < 1000) {
            return alert('시간 초과')
        } else {
            time = new Date(msLeft)
            mins = time.getUTCMinutes()
            secs = time.getUTCSeconds()
            msgTime = (mins ? mins + '분' + twoDigits(secs) : secs) + '초'
            var msg = '남은 시간: ' + msgTime
            setTimeout(updateTimer, time.getUTCMilliseconds() + 500)

            return alert(msg)
        }
    }
    endTime = (+new Date) + vaildTime + 500
    updateTimer()
}

module.exports = countdown