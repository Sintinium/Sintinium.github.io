// dom loaded event
document.addEventListener("DOMContentLoaded", onDomReady);

let elements = [];
let lastSelected = null;
let lastCompared = null;
let isPlaying = false;

let delay = 10;
let elementCount = 300;
let solver = null;
let diffFrame = false;

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

    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;
    for (let i = 0; i < elementCount; i++) {
        let div = document.createElement("div");
        div.classList.add("element");
        div.style.background = "linear-gradient(to top, #181818 0%, #474747 100%)";
        // let text = document.createTextNode(i);
        // div.appendChild(text);

        // FIXME: Element count needs - 4 for some reason?
        div.style.width = 100 / elementCount + .01 + "%";
        div.style.height = (i + 1) / elementCount * 100 + "%";
        div.style.left = i / elementCount * (100) + "%";
        div.style.bottom = 0 + "%";
        // div.style.transform = "scale(1, -1)";
        // div.style.width = containerWidth / (elementCount) + "px";
        // div.style.height = containerHeight * ((i + 1) / elementCount) + "px";
        // div.style.left = containerWidth * ((i + 1) / elementCount) + "px";
        // div.style.bottom = containerHeight + "px";
        div.setAttribute("value", i);
        // div.style.width = "20px";
        // div.style.height = "100px";
        container.appendChild(div);
        elements.push(div);
    }
    updateElementsOrder();
}

function play() {
    if (isRandomizing) {
        return;
    }

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
        if (!diffFrame && current - lastTime < delay) {
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
            return;
        }

        if (!diffFrame && diffTime >= delay * 2) {
            diffTime = 0;
            diffFrame = true;
            run();
            diffFrame = false;
        }

        if (!diffFrame) {
            setTimeout(run, 0);
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
    if (delay == 1) {
        delay = 2;
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


let isRandomizing = false;

function resetAndRandomize() {
    if (isRandomizing) {
        return;
    }
    reset();
    let r = randomize();
    let rand = function () {
        if (isPlaying) {
            isRandomizing = false;
            clearActives();
            return;
        }
        let next = r.next();
        if (next.done) {
            clearActives();
            isRandomizing = false;
            return;
        }
        let delay = 1;
        if (elementCount <= 64) {
            delay = 16;
        }
        setTimeout(rand, delay);
    };
    setTimeout(rand, 1);
    isRandomizing = true;
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
        case "quick-dual":
            solver = dualQuick;
            break;
        case "merge":
            solver = mergeSolver;
            break;
        case "heap":
            solver = heap;
            break;
        case "merge-bottom-up":
            solver = mergeBottomUpSolver;
            break;
        case "radix-lsd":
            solver = radixLsd;
            break;
        case "bitonic":
            solver = bitonic;
            break;
        case "counting":
            solver = countingSolver;
            break;
        case "gravity":
            solver = gravitySolver;
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

let dualQuick = function* () {
    yield* dualQuickSort(0, elements.length - 1);
}

function* dualQuickSort(low, high) {
    if (low < high) {
        let pivot = yield* dualPartition(low, high);
        yield* dualQuickSort(low, pivot[0] - 1);
        yield* dualQuickSort(pivot[0] + 1, pivot[1] - 1);
        yield* dualQuickSort(pivot[1] + 1, high);
    }
}

function* dualPartition(left, right) {
    if (getElementValue(elements[left]) > getElementValue(elements[right])) {
        swap(left, right);
        setActiveElement(elements[left]);
        setCompareElement(elements[right]);
        updateElementsOrder();
        yield;
    }

    let j = left + 1;
    let k = left + 1;
    let g = right - 1;

    let leftPivot = getElementValue(elements[left]);
    let rightPivot = getElementValue(elements[right]);

    while (k <= g) {
        if (getElementValue(elements[k]) < leftPivot) {
            swap(k, j);
            j++;
            setActiveElement(elements[k]);
            setCompareElement(elements[j]);
            updateElementsOrder();
            yield;
        } else if (getElementValue(elements[k]) >= rightPivot) {
            while (getElementValue(elements[g]) > rightPivot && k < g) {
                g--;
            }
            swap(k, g);
            setActiveElement(elements[g]);
            setCompareElement(elements[k]);
            updateElementsOrder();
            g--;

            if (getElementValue(elements[k]) < leftPivot) {
                setActiveElement(elements[k]);
                setCompareElement(elements[j]);
                quickSwap(k, j);
                updateElementsOrder();
                j++;
            }

            yield;
        }
        k++;
    }
    j--;
    g++;

    quickSwap(left, j);
    setActiveElement(elements[j]);
    setCompareElement(elements[left]);

    quickSwap(right, g);
    setActiveElement(elements[g]);
    setCompareElement(elements[right]);

    return [j, g];
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

let mergeBottomUpSolver = function* () {
    for (let i = 1; i < elements.length; i *= 2) {
        for (let j = 0; j < elements.length - i; j += i * 2) {
            yield* merge(j, j + i - 1, Math.min(j + i * 2 - 1, elements.length - 1));
        }
    }
}

function* mergeSort(low, high) {
    if (low < high) {
        let mid = Math.floor((low + high) / 2);
        yield* mergeSort(low, mid);
        yield* mergeSort(mid + 1, high);
        yield* merge(low, mid, high);
    }
}

function* mergeBottomUp(left, right, mid, rightEnd) {
    if (left < right) {
        yield* mergeBottomUp(left, mid, mid + 1, rightEnd);
        yield* merge(left, mid, right);
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
                updateElement(i);
                left++;
            } else {
                elements[i] = temp[right];
                setCompareElement(temp[left]);
                updateElement(i);
                right++;
            }
        } else if (left <= mid) {
            elements[i] = temp[left];
            setCompareElement(temp[mid])
            updateElement(i);
            left++;
        } else {
            elements[i] = temp[right];
            setCompareElement(temp[mid])
            updateElement(i);
            right++;
        }
        setActiveElement(elements[i]);
        playSoundFrom(elements[i]);
        yield;
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function indexToHex(i) {
    return rgbToHex(i, i, i);
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

// radix lsd
let radixLsd = function* solveRadixLSD() {
    let max = 0;
    let base = 10;
    for (let i = 0; i < elements.length; i++) {
        let value = getElementValue(elements[i]);
        if (value > max) {
            max = value;
        }
    }

    for (let place = 1; Math.floor(max / place) > 0; place *= base) {
        yield* countingSort(place, base);
    }
}

// counting sort
let countingSolver = function* () {
    yield* countingSort(null)
}

function* countingSort(place, base) {
    let getPlaceIndex = function (index) {
        if (place == null) {
            return getElementValue(elements[index]);
        }
        return Math.floor((getElementValue(elements[index]) / place) % base);
    }

    let max = 0;
    for (let i = 0; i < elements.length; i++) {
        let value = getElementValue(elements[i]);
        if (value > max) {
            max = value;
        }
    }
    let count = [];
    for (let i = 0; i <= max; i++) {
        count[i] = 0;
    }
    for (let i = 0; i < elements.length; i++) {
        count[getPlaceIndex(i)]++;
    }
    for (let i = 1; i <= max; i++) {
        count[i] += count[i - 1];
    }
    let sorted = [];
    for (let i = elements.length - 1; i >= 0; i--) {
        sorted[count[getPlaceIndex(i)] - 1] = elements[i];
        count[getPlaceIndex(i)]--;

        if (place == null && i % 4 == 0) {
            setCompareElement(elements[i]);
            yield;
        }
    }

    clearCompares();
    for (let i = 0; i < elements.length; i++) {
        // This line isn't needed. It's just to make the graph smooth and not fragmented from unupdated parts.
        elements[elements.indexOf(sorted[i])] = elements[i];

        elements[i] = sorted[i];
        updateElementsOrder();
        setActiveElement(elements[i]);

        // Skip a few sounds since this runs so fast it creates a lot of clipping. Only skip if delay is below a certain threshold.
        if (delay < 5) {
            if (i % 4 == 0) {
                playSoundFrom(elements[i]);
            }
        } else if (delay < 10) {
            if (i % 2 == 0) {
                playSoundFrom(elements[i]);
            }
        } else {
            playSoundFrom(elements[i]);
        }
        yield;
    }
}

let bitonic = function* solveBitonic() {
    yield* bitonicSort(0, elements.length, 1);
}

function* bitonicSort(left, length, direction) {
    if (length <= 1) {
        return;
    }
    let mid = Math.floor(length / 2);
    yield* bitonicSort(left, mid, 1);
    yield* bitonicSort(left + mid, mid, 0);
    yield* bitonicMerge(left, length, direction);
}

function* bitonicMerge(start, length, direction) {
    if (length <= 1) {
        return;
    }
    let mid = Math.floor(length / 2);
    for (let i = start; i < start + mid; i++) {
        let shouldSortAsc = getElementValue(elements[i]) > getElementValue(elements[i + mid]) && direction === 1;
        let shouldSortDesc = getElementValue(elements[i]) < getElementValue(elements[i + mid]) && direction == 0;
        if (shouldSortAsc || shouldSortDesc) {
            swap(i, i + mid);
            setActiveElement(elements[i]);
            setCompareElement(elements[i + mid]);
            updateElementsOrder();
            yield;
        }
    }

    yield* bitonicMerge(start, mid, direction);
    yield* bitonicMerge(start + mid, mid, direction);
}

// gravity sort
let gravitySolver = function* () {
    let max = 0;
    for (let i = 0; i < elements.length; i++) {
        let value = getElementValue(elements[i]);
        if (value > max) {
            max = value;
        }
    }

    // let grid = Array.from(Array(elements.length), () => Array(max));
    let grid = [];
    for (let i = 0; i < elements.length; i++) {
        grid[i] = [];
    }
    let levelCount = [];
    for (let i = 0; i < max; i++) {
        levelCount[i] = 0;
        for (let j = 0; j < elements.length; j++) {
            grid[j][i] = 0;
        }
    }

    for (let i = 0; i < elements.length; i++) {
        let k = getElementValue(elements[i]);
        for (let j = 0; k > 0; j++) {
            grid[levelCount[j]++][j] = 1;
            k--;
        }
    }

    let sorted = [];
    let elementsCopy = elements.slice();
    for (let i = 0; i < elements.length; i++) {
        let sum = 0;
        for (let j = 0; j < max && grid[elements.length - 1 - i][j] == 1; j++) {
            sum++;
        }
        // This is normal sorted[i] = sum. Since we're using DOM elements as storage we're just going to find it's index instead of the int value.
        let elem;
        for (let j = 0; j < elements.length; j++) {
            if (getElementValue(elementsCopy[j]) == sum) {
                elem = elements[j];
                break;
            }
        }
        sorted[i] = elem;


        swap(elements.indexOf(elem), elements.indexOf(elementsCopy[i]));
        // elements[elements.indexOf(elem)] = elements[i];
        // elements[i] = elem;
        updateElementsOrder()

        if (i % 1 == 0) {
            setActiveElement(elements[i]);
            playSoundFrom(elements[i]);
            yield;
        }
    }

    for (let i = 0; i < elements.length; i++) {

    }
}

let context = new AudioContext();
let maxFreq = 550;
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

    lastPlayed = performance.now();
    // Beep for 500 milliseconds
    setTimeout(function () {
        oscillator.stop();
    }, 50);
}

function getRandomizeSkip() {
    if (elementCount <= 256) {
        return 1;
    }
    if (elementCount <= 512) {
        return 4;
    }
    if (elementCount <= 1024) {
        return 32;
    }
    return elementCount;
}

function* randomize() {
    let randomized = elements.slice();
    for (let i = 0; i < elements.length; i++) {
        let j = Math.floor(Math.random() * elements.length);
        let temp = randomized[i];
        randomized[i] = randomized[j];
        randomized[j] = temp;
    }

    if (getRandomizeSkip() == elementCount) {
        elements = randomized;
        updateElementsOrder();
        return;
    }
    for (let i = 0; i < elements.length; i++) {
        elements[i] = randomized[i];
        updateElementsOrder();
        if (i % getRandomizeSkip() == 0) {
            playSoundFrom(elements[i]);
            setActiveElement(elements[i]);
            yield;
        }
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
        elements[i].style.left = i / elementCount * (100) + "%";
    }
}

function updateElement(i) {
    elements[i].style.left = i / elementCount * (100) + "%";
}

function setActiveElement(element) {
    if (!element) return;

    if (lastSelected) {
        let last = lastSelected;
        let delay = 10;
        if (elementCount < 256) {
            last.classList.remove("active");
        } else {
            setTimeout(() => {
                last.classList.remove("active");
            }, delay);
        }
    }
    element.classList.add("active");
    lastSelected = element;
}

function setCompareElement(element) {
    if (lastCompared) {
        let last = lastCompared;
        let delay = 10;
        if (elementCount < 256) {
            last.classList.remove("compare");
        } else {
            setTimeout(() => {
                last.classList.remove("compare");
            }, delay);
        }
    }
    element.classList.add("compare");
    lastCompared = element;
}

function setHeapElement(element, index) {
    element.classList.add("heap" + index);
}

function clearCompares() {
    if (lastCompared) {
        lastCompared.classList.remove("compare");
    }
}

function clearActives() {
    if (lastSelected) {
        lastSelected.classList.remove("active");
    }
}

function swap(i, j) {
    let temp = elements[i];
    elements[i] = elements[j];
    elements[j] = temp;
    playSound(elements[i].getAttribute("value") / elements.length);
}

function quickSwap(i, j) {
    let temp = elements[i];
    elements[i] = elements[j];
    elements[j] = temp;
}

class Element {
    constructor(docElement, value) {
        this.docElement = docElement;
        this.value = value;
    }
}
