import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren
} from "@angular/core";
import { CdkDrag } from "@angular/cdk/drag-drop";
import { bounce, fadeIn, fadeOut, rotateOut, rollOut, shake } from "ng-animate";
import { transition, trigger, useAnimation } from "@angular/animations";

@Component({
  selector: "app-tester",
  templateUrl: "./tester.component.html",
  styleUrls: ["./tester.component.scss"],
  animations: [
    trigger("rollOut", [
      transition("notCovered  => covered", useAnimation(rollOut))
    ])
  ]
})
export class TesterComponent implements OnInit {
  income = { name: "income", data: "100MB" };
  account = { name: "account", data: "200MB" };
  cat = { name: "cat", data: "200MB" };
  coveredState = "notCovered";
  @ViewChildren("acc", { read: CdkDrag }) cdkAccChildren: QueryList<CdkDrag>;
  @ViewChildren("cat", { read: CdkDrag }) cdkCatChildren: QueryList<CdkDrag>;
  constructor() {}
  changeState() {
    this.coveredState =
      this.coveredState === "notCovered" ? "covered" : "notCovered";
  }

  ngOnInit() {}
  do(e) {
    console.log(e.event.target.getBoundingClientRect());
  }
  detectCollision(e) {
    // html element, to get colliderBox
    let draggableElementRef = e.event.target;
    // cdk object to interact with its data
    let cdkDrag = e.source;

    let list;
    if (cdkDrag.getRootElement().classList.contains("inc")) {
      list = this.cdkAccChildren;
    } else if (cdkDrag.getRootElement().classList.contains("acc")) {
      list = this.cdkCatChildren
        .toArray()
        .concat(this.cdkAccChildren.toArray());
    }
    list.forEach(cdkDrop => {
      let droppableElementRef = cdkDrop.getRootElement();
      if (this.isCollide(draggableElementRef, droppableElementRef)) {
        console.log("sd");
        if (this.coveredState !== "covered") this.changeState();
      }
    });
  }

  private tryMakeTrasaktion(obj: any) {
    console.log(obj);
  }

  makeTransaction_ResetPosition(e, dragRef) {
    // html button
    let draggableElementRef = e.source.getRootElement();
    // cdkDrag object with data in it
    let cdkDrag = e.source;
    // create a list to iterate only through needed elements
    let list;
    let acc_to_acc_transaction;
    // draggable knows on which element it could be dropped
    if (draggableElementRef.classList.contains("inc")) {
      acc_to_acc_transaction = false;
      list = this.cdkAccChildren;
    } else if (draggableElementRef.classList.contains("acc")) {
      // account coins are allowed to be send to another accounts
      list = this.cdkCatChildren
        .toArray()
        .concat(this.cdkAccChildren.toArray());
      acc_to_acc_transaction = true;
    }
    list.forEach(cdkDrop => {
      let droppableElementRef = cdkDrop.getRootElement();
      if (this.isCollide(draggableElementRef, droppableElementRef)) {
        console.log("MakeTransaktion");
        this.tryMakeTrasaktion({
          acc_to_acc_transaction: acc_to_acc_transaction,
          cdkDrag,
          cdkDrop
        });
      }
    });
    e.source.reset();
    this.changeState();
  }
  isCollide(a, b) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
      aRect.top + aRect.height < bRect.top ||
      aRect.top > bRect.top + bRect.height ||
      aRect.left + aRect.width < bRect.left ||
      aRect.left > bRect.left + bRect.width
    );
  }
}
