// Example locations. Replace per story. Each builder returns a THREE.Group positioned at its x offset.
import * as THREE from 'three';
import {facade, ground, lampPost, barrel, signBoard} from '../kit.js';
import {makeCharacter} from '../char3.js';

export function buildStreet(x) {
  const g = new THREE.Group(); g.position.x = x;
  const gr = ground(60, '#8a6f52'); g.add(gr);
  const f = facade({w: 7, h: 5.2, windows: [{x: -2.2, y: 3.2, w: 0.9, h: 1.2}, {x: 0, y: 3.2, w: 0.9, h: 1.2}, {x: 2.2, y: 3.2, w: 0.9, h: 1.2}, {x: -2.2, y: 1.6, w: 0.9, h: 1.1}], door: {x: 1.6, w: 1.1, h: 2.3}});
  f.position.z = -1.5; g.add(f);
  const sign = signBoard('GRAND HOTEL'); sign.position.set(0, 4.5, -0.9); g.add(sign);
  const lamp = lampPost(); lamp.position.set(-3.8, 0, 0.5); g.add(lamp);
  const b = barrel(); b.position.set(3.4, 0, 1.2); g.add(b);
  const c1 = makeCharacter({palette: 'clerk', hat: 'bowler', seed: 1}); c1.position.set(-0.8, 0, 0.8); g.add(c1);
  const c2 = makeCharacter({palette: 'boss', hat: 'top', glasses: true, seed: 2}); c2.position.set(0.9, 0, 0.6); g.add(c2);
  return {group: g, characters: [c1, c2]};
}

export function buildOffice(x) {
  const g = new THREE.Group(); g.position.x = x;
  g.add(ground(30, '#6b5a4a', 21));
  const wall = facade({w: 8, h: 4.5, windows: [{x: 0, y: 2.6, w: 1.6, h: 1.4}], door: null, color: '#a9926c'});
  wall.position.z = -1.5; g.add(wall);
  const c = makeCharacter({palette: 'worker', hat: 'cap', seed: 3}); c.position.set(0, 0, 0.5); g.add(c);
  return {group: g, characters: [c]};
}

export const WORLDS = {street: buildStreet, office: buildOffice};
