import { assignAPIs, makeStateUpdater } from '../../utils'
import { table_getState } from '../../core/table/Tables.utils'
import { row_getAllCells } from '../../core/rows/Rows.utils'
import {
  row_getCenterVisibleCells,
  row_getLeftVisibleCells,
  row_getRightVisibleCells,
} from '../column-pinning/ColumnPinning.utils'
import {
  column_getCanHide,
  column_getIsVisible,
  column_getToggleVisibilityHandler,
  column_toggleVisibility,
  getDefaultColumnVisibilityState,
  row_getAllVisibleCells,
  row_getVisibleCells,
  table_getIsAllColumnsVisible,
  table_getIsSomeColumnsVisible,
  table_getToggleAllColumnsVisibilityHandler,
  table_getVisibleFlatColumns,
  table_getVisibleLeafColumns,
  table_resetColumnVisibility,
  table_setColumnVisibility,
  table_toggleAllColumnsVisible,
} from './ColumnVisibility.utils'
import type { TableState } from '../../types/TableState'
import type { CellData, RowData } from '../../types/type-utils'
import type { TableFeature, TableFeatures } from '../../types/TableFeatures'
import type { Table } from '../../types/Table'
import type { Row } from '../../types/Row'
import type { Column } from '../../types/Column'
import type {
  Column_ColumnVisibility,
  Row_ColumnVisibility,
  Table_ColumnVisibility,
  VisibilityDefaultOptions,
} from './ColumnVisibility.types'

/**
 * The Column Visibility feature adds column visibility state and APIs to the table, row, and column objects.
 * @link [API Docs](https://tanstack.com/table/v8/docs/api/features/column-visibility)
 */
export const ColumnVisibility: TableFeature = {
  getInitialState: <TFeatures extends TableFeatures>(
    state: TableState<TFeatures>,
  ): TableState<TFeatures> => {
    return {
      columnVisibility: getDefaultColumnVisibilityState(),
      ...state,
    }
  },

  getDefaultTableOptions: <
    TFeatures extends TableFeatures,
    TData extends RowData,
  >(
    table: Table<TFeatures, TData> &
      Partial<Table_ColumnVisibility<TFeatures, TData>>,
  ): VisibilityDefaultOptions => {
    return {
      onColumnVisibilityChange: makeStateUpdater('columnVisibility', table),
    }
  },

  constructColumn: <
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  >(
    column: Column<TFeatures, TData, TValue> & Partial<Column_ColumnVisibility>,
    table: Table<TFeatures, TData> &
      Partial<Table_ColumnVisibility<TFeatures, TData>>,
  ): void => {
    assignAPIs(column, table, [
      {
        fn: () => column_getIsVisible(column, table),
      },
      {
        fn: () => column_getCanHide(column, table),
      },
      {
        fn: () => column_getToggleVisibilityHandler(column, table),
      },
      {
        fn: (visible) => column_toggleVisibility(column, table, visible),
      },
    ])
  },

  constructRow: <TFeatures extends TableFeatures, TData extends RowData>(
    row: Row<TFeatures, TData> &
      Partial<Row_ColumnVisibility<TFeatures, TData>>,
    table: Table<TFeatures, TData> &
      Partial<Table_ColumnVisibility<TFeatures, TData>>,
  ): void => {
    assignAPIs(row, table, [
      {
        fn: () => row_getAllVisibleCells(row, table),
        memoDeps: () => [
          row_getAllCells(row, table),
          table_getState(table).columnVisibility,
        ],
      },
      {
        fn: (left, center, right) => row_getVisibleCells(left, center, right),
        memoDeps: () => [
          row_getLeftVisibleCells(row, table),
          row_getCenterVisibleCells(row, table),
          row_getRightVisibleCells(row, table),
        ],
      },
    ])
  },

  constructTable: <TFeatures extends TableFeatures, TData extends RowData>(
    table: Table<TFeatures, TData> &
      Partial<Table_ColumnVisibility<TFeatures, TData>>,
  ): void => {
    assignAPIs(table, table, [
      {
        fn: () => table_getVisibleFlatColumns(table),
        memoDeps: () => [
          table_getState(table).columnVisibility,
          table.options.columns,
        ],
      },
      {
        fn: () => table_getVisibleLeafColumns(table),
        memoDeps: () => [
          table_getState(table).columnVisibility,
          table.options.columns,
        ],
      },
      {
        fn: (updater) => table_setColumnVisibility(table, updater),
      },
      {
        fn: (defaultState) => table_resetColumnVisibility(table, defaultState),
      },
      {
        fn: (value) => table_toggleAllColumnsVisible(table, value),
      },
      {
        fn: () => table_getIsAllColumnsVisible(table),
      },
      {
        fn: () => table_getIsSomeColumnsVisible(table),
      },
      {
        fn: () => table_getToggleAllColumnsVisibilityHandler(table),
      },
    ])
  },
}
