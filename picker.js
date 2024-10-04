window.onload = init;

/**
 * @type {object}
 */
let weapons = {};
let tools = {};
let consumables = {};

let ammoRealNames = {
    'IA': 'Incendiary Ammo',
    'PA': 'Poison Ammo',
    'HVA': 'High Velocity Ammo',
    'SA': 'Spitzer Ammo',
    'DA': 'Dumdum Ammo',
    'FMJ': 'FMJ Ammo',
    'EA': 'Explosive Ammo',

    'F': 'Flechette Ammo',
    'S': 'Slug Ammo',
    'DB': 'Dragonbreath Ammo',
    'PSA': 'Penny Shot Ammo',

    'Shredder': 'Shredder Ammo',

    'Chaos': 'Chaos Bolt',
    'Poison': 'Poison Bolt',
    'Choke': 'Choke Bolt',
    'Dragon': 'Dragon Bolt',

    'Steel': 'Steel Bolt',
    'Explosive': 'Explosive Bolt',
    'Shot': 'Shot Bolt',

    'Concertina': 'Concertina Arrows',
    'Frag': 'Frag Arrows',
    'Poison': 'Poison Arrows',
};

// TODO: Solve for guns with multiple special ammo

function roll() {
    var preset = getPreset();
    if (preset === 'random') {
        var names = ['small', 'medium', 'full'];
        createLoadout(names[Math.floor(Math.random() * names.length)]);
    } else {
        createLoadout(preset);
    }
}

function getPreset() {
    return document.querySelector('input[name="preset"]:checked').id;
}

function createLoadout(name) {
    if (weapons === null) {
        console.error("Weapons not loaded yet...");
        return;
    }
    console.log("Creating loadout for " + name);
    result = null;
    if (name === 'small') {
        result = createSmallLoadout();
    } else if (name === 'medium') {
        result = createMediumLoadout();
    } else if (name === 'full') {
        result = createFullLoadout();
    } else {
        console.error("unknown loadout: " + name);
    }
    console.log(result);
    display(result);
}

function createSmallLoadout() {
    console.log(weapons.length)
    return {
        weapons: createWeaponPair(),
        tools: createTools(getRandomIntInclusive(2, 3)),
        consumables: createConsumables(getRandomIntInclusive(1, 2))
    };
}

function createMediumLoadout() {

}

function createFullLoadout() {

}

function createWeaponPair() {
    let result = {};
    result.third = null;
    let firstSlotSize = 3;
    if (Math.random() < .25) {
        firstSlotSize = 2;
    }
    result.first = randomElement(weapons.filter(it => it.slots === firstSlotSize));

    if (result.first.slots === 2) {
        result.second = randomElement(
            weapons.filter(it => it.slots <= 2 && it !== result.first && !('melee' in it) && it.name !== 'Hand Crossbow')
        );
        if (result.second.slots == 1) {
            result.third = result.second;
        }
    }

    if (result.first.slots === 3) {
        secondOptions = weapons.filter(it => it.slots === 1);
        result.second = randomElement(secondOptions);
        if ("melee" in result.second) {
            result.second = randomElement(createVariantObjects(result.second));
        }
    }

    result.first.selectedAmmo = randomElement(getWeaponAmmoNames(result.first.ammos));
    if ('ammos2' in result.first) {
        result.first.selectedAmmo += " & " + randomElement(getWeaponAmmoNames(result.first.ammos2));
    }

    if (result.second.ammos) {
        result.second.selectedAmmo = randomElement(getWeaponAmmoNames(result.second.ammos));
    }
    if ('ammos2' in result.second) {
        result.second.selectedAmmo += " & " + randomElement(getWeaponAmmoNames(result.second.ammos2));
    }

    return result;
}

function createTools(count) {
    var result = [];
    result.push(randomElement(tools.filter(it => it.category == "melee")));
    result.push(randomElement(tools.filter(it => it.category == "aid")));
    for (var i = 0; i < count - 2; i++) {
        result.push(randomElement(tools.filter(it => it.category !== "melee" && it.category !== "aid" && !result.includes(it))));
    }

    return result;
}

function createConsumables(count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push(randomElement(consumables.filter(it => it.category !== "antidote" && !result.includes(it))));
    }
    return result;
}

function randomElement(iterable) {
    return iterable[Math.floor(Math.random() * iterable.length)];
}

function loadData() {
    fetch('weapons.json')
        .then(response => response.json())
        .then(json => weapons = json);

    fetch('tools.csv')
        .then(response => response.text())
        .then(text => loadCSVtoJSON(text))
        .then(json => tools = json);

    fetch('consumables.csv')
        .then(response => response.text())
        .then(text => loadCSVtoJSON(text))
        .then(json => consumables = json);
}

function loadCSVtoJSON(csv) {
    var lines = csv.split("\n");
    var result = [];
    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j].trim();
        }

        result.push(obj);

    }
    return result;
}

/**
 * {weapons: {first, second, third}, tools: [], consumables: []}
 */
function display(result) {
    weapon1Text = result.weapons.first.name;
    if (result.weapons.first.selectedAmmo) {
        weapon1Text += " with " + result.weapons.first.selectedAmmo;
    }
    weapon1Div.textContent = weapon1Text;

    weapon2Text = result.weapons.second.name;
    if (result.weapons.third !== null) {
        weapon2Text += " x " + weapon2Text;
    }
    if (result.weapons.second.selectedAmmo) {
        weapon2Text += " with " + result.weapons.second.selectedAmmo;
    }
    weapon2Div.textContent = weapon2Text;

    toolDiv.textContent = result.tools.map(it => it.name).join(", ");

    consumableDiv.textContent = result.consumables.map(it => it.name).join(", ");
}

function init() {
    document.getElementById("roll-button").addEventListener("click", roll);
    weapon1Div = document.getElementById("weapon1");
    weapon2Div = document.getElementById("weapon2");
    toolDiv = document.getElementById("tools");
    consumableDiv = document.getElementById("consumables");
    loadData();
}

function createVariantObjects(original) {
    let variantNames = original.variants.split(',');
    let result = [];
    for (let variantName of variantNames) {
        result.push({
            name: variantName,
            price: original.pricem,
            slots: original.slots,
            variants: null,
            ammos: original.ammos,
            melee: true
        });
    }

    return result;
}

function getWeaponAmmoNames(ammos) {
    let names = ammos.split(',');
    let result = [];

    for (const name of names) {
        if (name in ammoRealNames) {
            result.push(ammoRealNames[name]);
        } else {
            result.push(name);
            console.info("NO NAME FOR " + name);
        }
    }
    result.push("Stock Ammo");
    return result;
}

function createWeaponObject(name, price, slots) {
    return {
        name: name,
        price: price,
        slots: slots
    }
}

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function weightedRandom(spec) {
    var i, sum = 0, r = Math.random();
    for (i in spec) {
        sum += spec[i];
        if (r <= sum) return i;
    }
    return weightedRand2(spec); // spec doesn't add up to 1
}