import { Component, OnInit } from '@angular/core';

export interface Tile {
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss']
})
export class PlaceholderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

   tiles: Tile[] = [
    {text: 'Two', cols: 1, rows: 1},
    {text: 'Three', cols: 1, rows: 1},
    {text: 'Four', cols: 1, rows: 1},
  ];

    tilesPool: any[] = [
      this.tiles, this.tiles, this.tiles
  ];
}
