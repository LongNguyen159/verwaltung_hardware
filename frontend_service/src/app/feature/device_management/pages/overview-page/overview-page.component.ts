import { AfterViewInit, Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewDeviceDialogComponent } from '../../components/new-device-dialog/new-device-dialog.component';
import { DeviceInput, DeviceMetaData, DeviceMetaData1 } from '../../models/device-models';
import { DeviceService } from '../../service/device.service';
import { Router } from '@angular/router';
import { generateQRCodeFromJSON } from '../../utils/utils';
import { Subject, take, takeUntil } from 'rxjs';
import { BasePageComponent } from 'src/app/shared/components/base-page/base-page.component';
@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.scss']
})

/** After adding new device into the database, remember to update the table datasource to reflect the changes
 * made to the database.
 * 
 * Subscribe to the DB changes: GET all devices list.
 * this.tableDataSource.data = newDataFromDB.
 * 
 * This approach means we have to get the whole list every time a new device is added.
 * Not efficient, but currently acceptable because there are more than 1 admin that 
 * can modify the database, so it's the safest to update it by getting all changes
 * for now.
 * 
 */
export class OverviewPageComponent extends BasePageComponent implements OnInit, AfterViewInit {
  @ViewChild('paginator1') paginator1: MatPaginator

  @ViewChild('paginator2') paginator2: MatPaginator
  @ViewChild(MatSort) sort: MatSort

  dialogRef: MatDialogRef<NewDeviceDialogComponent>

  displayedColumns: string[] = ['id', 'deviceName', 'location', 'inLage', 'actions']
  starredTableColumns: string[] = ['id', 'deviceName', 'location', 'inLage']
  tableDataSource: MatTableDataSource<DeviceMetaData>

  selectedRowsId: number[] = []
  selectedRow: DeviceMetaData[] = []

  selectedRowDataSource: MatTableDataSource<DeviceMetaData>


  destroyed$ = new Subject<void>()

  qrCodeDataUrl: string;

  constructor(public dialog: MatDialog, private deviceServive: DeviceService, private router: Router) {
    super()
  }

  ngOnInit(): void {
    /** Get device list here, assign tableDataSource to be the result. */
    this.deviceServive.getAllItems().pipe(takeUntil(this.componentDestroyed$)).subscribe(allItems => {
      console.log(allItems)
      this.tableDataSource = new MatTableDataSource(allItems); /** Change to real data here; 'dataSource' is real data */

      this.selectedRowDataSource = new MatTableDataSource()

      this.tableDataSource.sort = this.sort;
      this.tableDataSource.paginator = this.paginator1
      this.selectedRowDataSource.paginator = this.paginator2
  
      this.loadSavedDataFromLocalStorage()
    })

  }

  ngAfterViewInit(): void {
    
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase()
  }

  loadSavedDataFromLocalStorage() {
    const savedSelectedRow = localStorage.getItem('selectedRow')
    const savedSelectedRowsId = localStorage.getItem('selectedRowsId')
  
    if (savedSelectedRow && savedSelectedRowsId) {
      this.selectedRow = JSON.parse(savedSelectedRow)
      this.selectedRowsId = JSON.parse(savedSelectedRowsId)

      
      this.updateStarredDeviceTable()
    }
  }

  onStarDeviceClick(row: DeviceMetaData) {
    const index = this.selectedRowsId.indexOf(row.id)
    if (index === -1) {
      this.addSelectedRow(row)
    } else {
      this.removeDeselectedRow(index)
    }
  }

  private addSelectedRow(row: DeviceMetaData) {
    this.selectedRowsId.unshift(row.id)
    this.selectedRow.unshift(row)
    this.updateStarredDeviceTable()
    this.saveDataToLocalStorage()
  }

  private removeDeselectedRow(index: number) {
    this.selectedRowsId.splice(index, 1)
    this.selectedRow.splice(index, 1)
    this.updateStarredDeviceTable()
    this.saveDataToLocalStorage()
  }


  unstarredAllItems() {
    this.selectedRow = []
    this.selectedRowsId = []
    this.updateStarredDeviceTable()
    this.saveDataToLocalStorage()
  }

  private updateStarredDeviceTable() {
    this.selectedRowDataSource.data = this.selectedRow
    this.selectedRowDataSource.paginator = this.paginator2
  }


  private saveDataToLocalStorage() {
    localStorage.setItem('selectedRow', JSON.stringify(this.selectedRow));
    localStorage.setItem('selectedRowsId', JSON.stringify(this.selectedRowsId));
  }

  isRowSelected(rowId: number): boolean {
    return this.selectedRowsId.includes(rowId)
  }


  openNewDeviceDialog() {
    this.dialogRef = this.dialog.open(NewDeviceDialogComponent, {
      disableClose: false,
    })

    this.dialogRef.afterClosed().subscribe((results: DeviceInput) => {
      if (results) {
        console.log(results)
        /** Create new device, send to API to create new item in DB. Pass device input as args */

        /** Subscribe to backend results, backend should return a JSON.
         * Use that JSON to generate a QR code.
         */
      }
    })
    this.dialogRef = null as any
  }


  navigateToDetailsPage(id: number) {
    this.router.navigate(['/device-details', id])

  }
}


/** Creating new device/item process: */
// Name + Location POST request => backend
// backend write new device into DB.
// backend response to POST request: JSON


/** TODOs
 * - [ ] Feature: API endpoint for writing new devices that only needs name and location to write
 * - [X] Feature: Device details page
 * - [X] Feature: endpoint for getting device info by ID
 * - [X] Feature: Starred items -> Store them in Local Storage
 * 
 * - [ ] Fix: Flatten return results for simpler sorting and filtering methods in FE
 * - [X] Bug: CORS Header dependency is not being recognised
 * - [ ] Feature: Modify item description
 * - [ ] Feature: Table actions: Delete rows
 * - [ ] Feature: API endpoint for removing rows in DB
 */
