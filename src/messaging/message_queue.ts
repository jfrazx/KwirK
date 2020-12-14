//
// export default class MessageQueue {
//   constructor() {
//
//   }
// }

interface Path {
  to: string;
  distance: number;
}

interface Paths {
  [path: string]: Path[];
}

interface Places {
  places: string[];
  length: number;
}

const roads: Paths = {};

function show<T>(...paths: T[]): void {
  paths.forEach(path => {
    console.dir(path);
  });
}

function makeRoad(from: string, to: string, distance: number) {
  function addRoad(from: string, to: string) {
    if (!(from in roads)) {
      roads[from] = [];
    }

    roads[from].push({ to, distance });
  }

  addRoad(from, to);
  addRoad(to, from);
}

function makeRoads(from: string, ...destinations: (string | number)[]) {
  for (let index = 0; index < destinations.length; index += 2) {
    makeRoad(
      from,
      <string>destinations[index],
      <number>destinations[index + 1],
    );
  }
}

function roadsFrom(place: string): Path[] {
  if (!roads[place]) {
    throw new Error(`No place '${place}' found`);
  }

  return roads[place];
}

function gamblerPath(from: string, to: string) {
  function randomInteger(below: number): number {
    return Math.floor(Math.random() * below);
  }

  function randomDirection(from: string): string {
    const options = roadsFrom(from);

    return options[randomInteger(options.length)].to;
  }

  const path: string[] = [];

  while (true) {
    path.push(from);

    if (from === to) {
      break;
    }

    from = randomDirection(from);
  }

  return path;
}

function member<T>(array: T[], value: T): boolean {
  return any(array, function(element: T) {
    return element === value;
  });
}

function flatten<T>(arrays: Array<T | T[]>): T[] {
  const result: T[] = [];

  arrays.forEach(function(array) {
    if (Array.isArray(array)) {
      array.forEach(function(element) {
        result.push(element);
      });
    } else {
      result.push(array);
    }
  });

  return result;
}

function filter<T>(array: T[], callback: Function): T[] {
  const result: T[] = [];

  array.forEach(function(element) {
    if (callback(element)) {
      result.push(element);
    }
  });

  return result;
}

function every<T>(array: T[], callback: Function): boolean {
  for (let index = 0, length = array.length; index < length; index++) {
    if (!callback(array[index])) {
      return false;
    }
  }

  return true;
}

function any<T>(array: T[], callback: Function): boolean {
  for (let index = 0, length = array.length; index < length; index++) {
    if (callback(array[index])) {
      return true;
    }
  }

  return false;
}

function map<T, TResult>(
  array: T[],
  callback: (element: T, index?: number) => TResult,
): TResult[] {
  const result: TResult[] = [];

  array.forEach(function(element, index) {
    result.push(callback(element, index));
  });

  return result;
}

function possibleRoutes(from: string, to: string) {
  function findRoutes(route: Places): Array<Places> {
    function notVisited(road: Path): boolean {
      return !member(route.places, road.to);
    }

    function continueRoute(road: Path) {
      return findRoutes({
        places: route.places.concat([road.to]),
        length: route.length + road.distance,
      });
    }

    const end = route.places[route.places.length - 1];

    if (end === to) {
      return [route];
    } else {
      return flatten(map(filter(roadsFrom(end), notVisited), continueRoute));
    }
  }

  return findRoutes({ places: [from], length: 0 });
}

function shortestPath(from: string, to: string): Places {
  const routes = possibleRoutes(from, to);

  let shortest: Places = routes[0];

  routes.forEach(function(place) {
    if (shortest.length > place.length) {
      shortest = place;
    }
  });

  return shortest;
}

makeRoads('Point Kiukiu', 'Hanaiapa', 19, 'Mt Feani', 15, 'Taaoa', 15);
makeRoads('Airport', 'Hanaiapa', 6, 'Mt Feani', 5, 'Atuona', 4, 'Mt Ootua', 11);
makeRoads('Mt Temetiu', 'Mt Feani', 8, 'Taaoa', 4);
makeRoads('Atuona', 'Taaoa', 3, 'Hanakee pearl lodge', 1);
makeRoads('Cemetery', 'Hanakee pearl lodge', 6, 'Mt Ootua', 5);
makeRoads('Hanapaoa', 'Mt Ootua', 3);
makeRoads('Puamua', 'Mt Ootua', 13, 'Point Teohotepapapa', 14);

show(possibleRoutes('Point Teohotepapapa', 'Point Kiukiu').length);
show(possibleRoutes('Hanapaoa', 'Mt Ootua'));

show(shortestPath('Point Teohotepapapa', 'Point Kiukiu'));
