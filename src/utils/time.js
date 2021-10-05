import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-cn'
import { isNil } from 'lodash'

dayjs.locale('zh-cn')
dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.extend(duration)

export function formatTime(dateStr, format) {
  // console.log('🚀 > file: index.js:752 > formatTimeDayjs > args:', args)
  // return dayjs(...args)
  if (isNil(dateStr)) return ''
  return dayjs(dateStr).format(format)
}

export const time = dayjs
