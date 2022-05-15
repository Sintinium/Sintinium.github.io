// dom loaded event
document.addEventListener("DOMContentLoaded", onDomReady);

let elements = [];
let lastSelected = null;
let lastCompared = null;
let isPlaying = false;

let delay = 10;
let elementCount = 300;
let solver = null;

function onDomReady() {
    setCount();
    setType();
    setSpeed();
    createElementsArray();

    // setInterval(function () {
    //     let child = document.querySelector(".container > div:first-child");
    //     let child1 = document.querySelector(".container > div:nth-child(2)");
    //     container.insertBefore(child1, child);
    // }, 1000);
    // const img = document.createElement("img");
    // img.src = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png";
    // document.body.appendChild(img);
    // randomize();


    // let o = quickSort(0, elements.length - 1);
    // let o = solveHeap();
    // setInterval(function () {
    //     let next = o.next();
    //     if (next.done) {
    //         isPlaying = false;
    //         clearInterval(this);
    //     }
    // }, 10);
}

function createElementsArray() {
    let container = document.getElementsByClassName("container")[0];
    container.textContent = "";
    elements = [];

    for (let i = 0; i < elementCount; i++) {
        let div = document.createElement("div");
        div.classList.add("element");
        div.style.background = "linear-gradient(to top, #181818 0%, #474747 100%)";
        // let text = document.createTextNode(i);
        // div.appendChild(text);

        // FIXME: Element count needs - 4 for some reason?
        div.style.width = 100 / (elementCount - 4) + "%";
        div.style.height = (i + 1) / elementCount * 100 + "%";
        div.setAttribute("value", i);
        // div.style.width = "20px";
        // div.style.height = "100px";
        container.appendChild(div);
        elements.push(div);
    }
    updateElementsOrder();
}

function play() {
    if (isPlaying) {
        reset();
        return;
    }
    document.getElementById("play").innerHTML = "Stop";
    isPlaying = true;
    let o = solver();

    let lastTime = performance.now();
    let i = 0;
    let diffTime = 0;

    let totalTime = 0;
    let rollingIndex = 0;
    let samples = Array(40).fill(0);


    function addRollingTime(time) {
        totalTime -= samples[rollingIndex];
        samples[rollingIndex] = time;
        totalTime += time;
        rollingIndex++;
        if (rollingIndex >= samples.length) {
            rollingIndex = 0;
        }
    }

    let run = function () {
        if (!isPlaying) {
            return;
        }

        let current = performance.now();
        if (diffTime < delay && current - lastTime < delay) {
            setTimeout(run, 0);
            return;
        }

        let next = o.next();
        addRollingTime(current - lastTime);

        i++;
        if (i % 15 === 0) {
            // updateStats(Math.round((current - lastTime)));
            updateStats(Math.round(totalTime / samples.length));
        }
        if (current - lastTime > delay) {
            diffTime += current - lastTime - delay;
        }
        lastTime = current;


        if (next.done) {
            reset();
        }

        if (diffTime < delay) {
            setTimeout(run, 0);
        }
        while (diffTime >= delay) {
            diffTime -= delay;
            run();
        }

    }
    setTimeout(run, 0);
}

function updateStats(delay) {
    document.getElementById("stats").innerHTML = "Delay: " + delay + "ms";
}

function setSpeed() {
    let slider = parseFloat(document.getElementById("speed").value);
    delay = (.05 * Math.pow(slider, 2)).toFixed(2);
    if (delay == 0) {
        delay = .01;
    }
    // if (delay - Math.floor(delay) < .05) {
    //     delay = Math.floor(delay);
    // }
    // if (Math.ceil(delay) - delay < .05) {
    //     delay = Math.ceil(delay);
    // }

    if (delay > 10) {
        delay = Math.round(delay);
    } else {
        delay = (Math.round(delay * 2) / 2);
    }
    // if (delay > 99.8) {
    //     delay = 100;
    // }
    document.getElementsByClassName("slider")[0].getElementsByTagName("p")[1].innerHTML = delay + "ms";
}

function setCount() {
    let slider = parseInt(document.getElementById("count").value);
    elementCount = Math.pow(2, slider + 5)
    reset();
    document.getElementsByClassName("count-slider")[0].getElementsByTagName("p")[1].innerHTML = elementCount;
}

function resetAndRandomize() {
    reset();
    randomize();
    updateElementsOrder();
}

function reset() {
    isPlaying = false;
    document.getElementById("play").innerHTML = "Play";
    createElementsArray();
}

function setType() {
    let type = document.getElementById("type").value;
    let oldSolver = solver;
    switch (type) {
        case "bubble":
            solver = bubble;
            break;
        case "insertion":
            solver = insertion;
            break;
        case "quick":
            solver = quick;
            break;
        case "merge":
            solver = mergeSolver;
            break;
        case "heap":
            solver = heap;
            break;
    }
    if (oldSolver !== solver) {
        reset();
    }
}

let quick = function* solveQuick() {
    yield* quickSort(0, elements.length - 1);
}

function* quickSort(low, high) {
    if (low < high) {
        let pivot = yield* partition(low, high);
        yield* quickSort(low, pivot - 1);
        yield* quickSort(pivot + 1, high);
    }
}

function* partition(low, high) {
    let pivot = elements[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        setActiveElement(elements[j]);
        setCompareElement(elements[high]);
        if (getElementValue(elements[j]) < getElementValue(pivot)) {
            i++;
            swap(i, j);
            updateElementsOrder();
            yield;
        }
    }
    let temp = elements[i + 1];
    elements[i + 1] = elements[high];
    elements[high] = temp;
    updateElementsOrder();
    return i + 1;
}

let bubble = function* solveBubble() {
    for (let j = 0; j < elements.length; j++) {
        for (let i = 0; i < elements.length - 1; i++) {
            setActiveElement(elements[i]);
            setCompareElement(elements[i + 1]);
            if (getElementValue(elements[i]) > getElementValue(elements[i + 1])) {
                swap(i, i + 1);
                updateElementsOrder();
                yield;
            }
        }
    }
}

let insertion = function* solveInsertion() {
    for (let i = 1; i < elements.length; i++) {
        let j = i;
        while (j > 0 && getElementValue(elements[j]) < getElementValue(elements[j - 1])) {
            swap(j, j - 1);
            setActiveElement(elements[j]);
            updateElementsOrder();
            yield;
            j--;
        }
    }
}

function* insertionSort(left, right) {
    for (let i = left + 1; i <= right; i++) {
        setActiveElement(elements[i]);
        setCompareElement(elements[i - 1]);
        if (getElementValue(elements[i]) < getElementValue(elements[i - 1])) {
            swap(i, i - 1);
            updateElementsOrder();
            yield;
        }
    }
}

let mergeSolver = function* solveMerge() {
    yield* mergeSort(0, elements.length - 1);
}

function* mergeSort(low, high) {
    if (low < high) {
        let mid = Math.floor((low + high) / 2);
        yield* mergeSort(low, mid);
        yield* mergeSort(mid + 1, high);
        yield* merge(low, mid, high);
    }
}

function* merge(low, mid, high) {
    let left = low;
    let right = mid + 1;
    let temp = [];
    for (let i = low; i <= high; i++) {
        temp[i] = elements[i];
    }

    for (let i = low; i <= high; i++) {
        if (left <= mid && right <= high) {
            if (getElementValue(temp[left]) < getElementValue(temp[right])) {
                elements[i] = temp[left];
                setCompareElement(temp[right]);
                left++;
            } else {
                elements[i] = temp[right];
                setCompareElement(temp[left]);
                right++;
            }
        } else if (left <= mid) {
            elements[i] = temp[left];
            setCompareElement(temp[mid])
            left++;
        } else {
            elements[i] = temp[right];
            setCompareElement(temp[mid])
            right++;
        }
        setActiveElement(elements[i]);
        playSoundFrom(elements[i]);
        updateElementsOrder();
        yield;
    }
}

let heap = function* solveHeap() {
    for (let i = Math.floor(elements.length / 2); i >= 0; i--) {
        yield* heapify(i, elements.length);
    }
    for (let i = elements.length - 1; i >= 0; i--) {
        swap(0, i);
        // setActiveElement(elements[0]);
        setCompareElement(elements[i]);
        updateElementsOrder();
        yield;
        yield* heapify(0, i);
    }
}

function* heapify(i, n) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;
    if (left < n && getElementValue(elements[left]) > getElementValue(elements[largest])) {
        largest = left;
    }
    if (right < n && getElementValue(elements[right]) > getElementValue(elements[largest])) {
        largest = right;
    }
    if (largest !== i) {
        swap(i, largest);
        setActiveElement(elements[i]);
        // setCompareElement(elements[largest]);
        updateElementsOrder();
        yield;
        yield* heapify(largest, n);
    }
}

let context = new AudioContext();
let maxFreq = 600;
let minFreq = 150;

function playSoundFrom(element) {
    if (!element) return;

    let i = parseInt(element.getAttribute("value"));
    playSound(i / elements.length);
}

function getElementValue(element) {
    return parseInt(element.getAttribute("value"));
}

function playSound(pitch) {
    var oscillator = new OscillatorNode(context);
    let gain = new GainNode(context);
    gain.gain.value = .005;
    oscillator.type = "square";
    oscillator.frequency.value = maxFreq - (maxFreq - minFreq) * (1 - pitch);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    // Beep for 500 milliseconds
    setTimeout(function () {
        oscillator.stop();
    }, 50);
}

function randomize() {
    for (let i = 0; i < elements.length; i++) {
        let j = Math.floor(Math.random() * elements.length);
        let temp = elements[i];
        elements[i] = elements[j];
        elements[j] = temp;
    }
}

function updateElementsOrderArr(elems) {
    let container = document.getElementsByClassName("container")[0];
    for (let i = 0; i < elems.length; i++) {
        elems[i].style.order = i;
    }
}

function updateElementsOrder() {
    let container = document.getElementsByClassName("container")[0];
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.order = i;
    }
}

function setActiveElement(element) {
    if (!element) return;

    if (lastSelected) {
        lastSelected.classList.remove("active");
    }
    element.classList.add("active");
    lastSelected = element;
}

function setCompareElement(element) {
    if (lastCompared) {
        lastCompared.classList.remove("compare");
    }
    element.classList.add("compare");
    lastCompared = element;
}

function swap(i, j) {
    let temp = elements[i];
    elements[i] = elements[j];
    elements[j] = temp;
    playSound(elements[i].getAttribute("value") / elements.length);
}

class Element {
    constructor(docElement, value) {
        this.docElement = docElement;
        this.value = value;
    }
}
