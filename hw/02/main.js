let model;
const infoSelector = '#info';
const resultSelector = '#result';
const startButton = '#startButton';

class Model {
    constructor(weatherRowData) {
        this.description = weatherRowData.query.results.channel.description;
        this.city = weatherRowData.query.results.channel.location.city;
        this.date = weatherRowData.query.results.channel.item.condition.date;
        this.temp = weatherRowData.query.results.channel.item.condition.temp;
        this.text = weatherRowData.query.results.channel.item.condition.text;
    }

    toString() {
        return `City: ${this.city}`;
    }

    isDataSet() {
        let result = false;
        if (typeof (this.city) !== 'undefined') {
            result = true;
        }
        return result
    }
}

class View {
    static DEBUG() {
        return true;
    }

    static info(message) {
        if (View.DEBUG()) console.log(message);
        document.querySelector(infoSelector).textContent = `${message}`;
    }

    static clearResult() {
        const myNode = document.querySelector(resultSelector);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
    }

    static result(model) {
        if (View.DEBUG()) console.log(model);
        const celsiumTemp = View.f_to_celsium(model.temp);
        const child = `<h3>${model.description}</h3><h5>${model.date}</h5><h5>Temperature: ${celsiumTemp} C</h5><h5>Description: ${model.text}</h5>`;
        document.querySelector(resultSelector).insertAdjacentHTML('beforeend', child);
    }

    static f_to_celsium(f) {
        return Math.round(10.0 * 5.0 / 9.0 * (f - 32.0)) / 10.0;
    }

    static buttonActive(active) {
        document.querySelector(startButton).disabled = (active)?(''):('disabled');
    }
}

const requestWeatherAPI = () => {
    const apiURL = 'https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="kharkiv, ua")&format=json&env=store://datatables.org/alltableswithkeys';
    const xhr = new XMLHttpRequest();
    let response;

    xhr.open('GET', apiURL, true);
    xhr.timeout = 1000;
    xhr.ontimeout = () => {
        View.info('Service unavailable.');
    };
    xhr.onload = () => {
        response = JSON.parse(xhr.responseText);
        model = new Model(response);
    };
    xhr.send();
};

const nextStep = (ms, message) => {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            resolve(message);
        }, ms);
    });
};

const handler = () => {
    View.clearResult();
    View.buttonActive(false);
    View.info('One second waiting before request send.');

    nextStep(1000, 'Sending API request.')
        .then(done => {
            View.info(done);
            requestWeatherAPI();
            return nextStep(1000, 'Waiting for response a second.');
        })
        .then(done => {
            View.info(done);
            if (typeof (model) !== 'undefined' && model.isDataSet()) {
                return nextStep(1000, 'Done!');
            } else {
                throw('No data recieved!');
            }
        })
        .then(done => {
            View.info(done);
            View.result(model);
            return nextStep(1000, 'Push the button!');
        })
        .then(done => {
            View.info(done);
            View.buttonActive(true);
            //
        })
        .catch(err => {
            View.info(err);
            View.buttonActive(true);
        });
};

//document.querySelector('#startButton').addEventListener('click', handler);