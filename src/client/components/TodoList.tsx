import type { SVGProps } from 'react'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@trpc/react'
import * as Checkbox from '@radix-ui/react-checkbox'
import autoAnimate from '@formkit/auto-animate'

import { api } from '@/utils/client/api'

export const TodoList = () => {
  const tabs = ['All', 'Pending', 'Completed']
  const [type, setType] = useState('all')
  const [filteredTodos, setFilteredTodos] = useState([])

  const listRef = useRef<HTMLUListElement | null>(null)

  // Fetch todos with statuses
  const { data: todos = [], refetch } = api.todo.getAll.useQuery({
    statuses: ['completed', 'pending'],
  })

  // Mutation to update todo status
  const updateStatus = api.todoStatus.update.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => console.error('Error updating status:', error),
  })

  // Mutation to delete todo
  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => console.error('Error deleting todo:', error),
  })

  // Handle checkbox change
  const handleCheckboxChange = (todoId: string, checked: boolean) => {
    updateStatus.mutate({
      todoId: todoId,
      status: checked ? 'completed' : 'pending',
    })
    setFilteredTodos(todos)
  }

  // Handle delete button click
  const handleDelete = (todoId: string) => {
    deleteTodo.mutate({ id: todoId })
  }

  // Apply animation effect to todo list
  useEffect(() => {
    if (listRef.current) {
      autoAnimate(listRef.current)
    }
  }, [])

  useEffect(() => {
    if (type !== 'all') {
      const filtered = todos.filter((todo) => todo.status === type)
      setFilteredTodos(filtered)
    } else {
      setFilteredTodos(todos)
    }
  }, [todos, type])

  return (
    <>
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`rounded-full px-8 py-3 text-black ${
            type === tab.toLowerCase()
              ? 'bg-gray-700 text-white'
              : 'bg-white hover:bg-black hover:text-white'
          }`}
          style={{
            marginRight: '8px', // thêm khoảng cách giữa các button
            marginBottom: '20px', // thêm khoảng cách dưới các button
          }}
          onClick={() => setType(tab.toLowerCase())}
        >
          {tab}
        </button>
      ))}

      <ul ref={listRef} className="grid grid-cols-1 gap-y-3">
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <div
              className={`flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm ${
                todo.status === 'completed'
                  ? 'text-gray-400 line-through'
                  : 'text-black'
              }`}
            >
              <Checkbox.Root
                id={String(todo.id)}
                className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                checked={todo.status === 'completed'}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(todo.id, checked === true)
                }
              >
                <Checkbox.Indicator>
                  <CheckIcon className="h-4 w-4 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label
                className="block pl-3 font-medium"
                htmlFor={String(todo.id)}
              >
                {todo.body}
              </label>
              <button
                className="text-red-500 hover:text-red-700 ml-auto p-1"
                aria-label="Delete todo"
                onClick={() => handleDelete(todo.id)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

// XMarkIcon component for delete button
const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

// CheckIcon component for checkbox
const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
