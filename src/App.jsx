import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Edit3,
  Filter,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

import { supabase } from './supabaseClient'


import './App.css'

const initialTasks = [
  {
    id: 1,
    title: 'DBMS Mini Project',
    subject: 'Database Management Systems',
    description: 'Complete ER diagram and database implementation.',
    deadline: '2026-10-07',
    priority: 'High',
    estimatedTime: '2h 30m',
    completed: false,
  },
  {
    id: 2,
    title: 'OS Assignment',
    subject: 'Operating Systems',
    description: 'Complete process scheduling questions.',
    deadline: '2026-10-09',
    priority: 'Medium',
    estimatedTime: '1h 30m',
    completed: false,
  },
  {
    id: 3,
    title: 'Mathematics Problem Set',
    subject: 'Engineering Mathematics',
    description: 'Solve the assigned differential equations.',
    deadline: '2026-10-12',
    priority: 'Low',
    estimatedTime: '45 min',
    completed: false,
  },
  {
    id: 4,
    title: 'Computer Networks Notes',
    subject: 'Computer Networks',
    description: 'Prepare notes for the upcoming lecture.',
    deadline: '2026-10-15',
    priority: 'Medium',
    estimatedTime: '1h',
    completed: true,
  },
  {
    id: 5,
    title: 'Web Development Practice',
    subject: 'Web Development',
    description: 'Build a responsive landing page.',
    deadline: '2026-10-18',
    priority: 'Low',
    estimatedTime: '2h',
    completed: false,
  },
]

const defaultTask = {
  title: '',
  subject: '',
  description: '',
  deadline: '',
  priority: 'Medium',
  estimatedTime: '',
}

const priorityConfig = {
  High: {
    color: '#ef4444',
    background: '#fef2f2',
  },
  Medium: {
    color: '#f59e0b',
    background: '#fff7ed',
  },
  Low: {
    color: '#22c55e',
    background: '#f0fdf4',
  },
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    icon: ListTodo,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: CalendarDays,
  },
  {
    id: 'planner',
    label: 'Smart Planner',
    icon: Sparkles,
  },
]

function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDate(dateString) {
  if (!dateString) return 'No deadline'

  const date = new Date(`${dateString}T00:00:00`)

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getShortDate(dateString) {
  if (!dateString) return { day: '--', month: '---' }

  const date = new Date(`${dateString}T00:00:00`)

  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en-US', {
      month: 'short',
    }).toUpperCase(),
  }
}

function getDaysUntil(dateString) {
  if (!dateString) return null

  const today = new Date(`${getTodayString()}T00:00:00`)
  const deadline = new Date(`${dateString}T00:00:00`)

  const difference = deadline - today

  return Math.ceil(difference / (1000 * 60 * 60 * 24))
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'

  return 'Good evening'
}

function getDateLabel(dateString) {
  const days = getDaysUntil(dateString)

  if (days === null) return 'No deadline'
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'

  return `Due in ${days} days`
}

function App() {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('studentflow-name') || 'Student'
  })

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('studentflow-tasks')

    if (savedTasks) {
      try {
        return JSON.parse(savedTasks)
      } catch {
        return initialTasks
      }
    }

    return initialTasks
  })

  const [activePage, setActivePage] = useState('dashboard')

  const [searchQuery, setSearchQuery] = useState('')

  const [taskFilter, setTaskFilter] = useState('All')

  const [showTaskModal, setShowTaskModal] = useState(false)

  const [editingTask, setEditingTask] = useState(null)

  const [taskForm, setTaskForm] = useState(defaultTask)

  const [showSettings, setShowSettings] = useState(false)

  const [nameInput, setNameInput] = useState(userName)

  const [showNotifications, setShowNotifications] = useState(false)

  const [toast, setToast] = useState(null)

  const [selectedDate, setSelectedDate] = useState(getTodayString())

    useEffect(() => {
    localStorage.setItem('studentflow-name', userName)
  }, [userName])

  useEffect(() => {
  localStorage.setItem('studentflow-tasks', JSON.stringify(tasks))
}, [tasks])

useEffect(() => {
  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true })

    if (error) {
      console.error('Error loading tasks:', error)
      return
    }

    const formattedTasks = data.map((task) => ({
      id: task.id,
      title: task.title,
      subject: task.subject,
      description: task.description || '',
      deadline: task.deadline,
      priority: task.priority,
      estimatedTime: task.estimated_time || '',
      completed: task.completed,
    }))

    setTasks(formattedTasks)
  }

  loadTasks()
}, [])


  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => {
      setToast(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast])

  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.completed)
  }, [tasks])

  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => !task.completed)
  }, [tasks])

  const dueSoonTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.completed || !task.deadline) return false

      const days = getDaysUntil(task.deadline)

      return days >= 0 && days <= 7
    })
  }, [tasks])

  const progressPercentage = useMemo(() => {
    if (tasks.length === 0) return 0

    return Math.round(
      (completedTasks.length / tasks.length) * 100
    )
  }, [tasks.length, completedTasks.length])

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const search = searchQuery.toLowerCase().trim()

        if (!search) return true

        return (
          task.title.toLowerCase().includes(search) ||
          task.subject.toLowerCase().includes(search) ||
          task.description.toLowerCase().includes(search)
        )
      })
      .filter((task) => {
        if (taskFilter === 'All') return true
        if (taskFilter === 'Pending') return !task.completed
        if (taskFilter === 'Completed') return task.completed

        return task.priority === taskFilter
      })
      .sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1

        return a.deadline.localeCompare(b.deadline)
      })
  }, [tasks, searchQuery, taskFilter])

  const upcomingTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.deadline && !task.completed)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 4)
  }, [tasks])

  const todayTasks = useMemo(() => {
    const today = getTodayString()

    return tasks
      .filter((task) => !task.completed)
      .sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1

        return a.deadline.localeCompare(b.deadline)
      })
      .slice(0, 3)
  }, [tasks])

    const showToast = (message, type = 'success') => {
    setToast({
      message,
      type,
    })
  }

  const openAddTask = () => {
    setEditingTask(null)

    setTaskForm({
      ...defaultTask,
      deadline: getTodayString(),
    })

    setShowTaskModal(true)
  }

  const openEditTask = (task) => {
    setEditingTask(task)

    setTaskForm({
      title: task.title,
      subject: task.subject,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      estimatedTime: task.estimatedTime,
    })

    setShowTaskModal(true)
  }

  const closeTaskModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
    setTaskForm(defaultTask)
  }

  const handleTaskFormChange = (field, value) => {
    setTaskForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

 const saveTask = async (event) => {
  event.preventDefault()

  if (!taskForm.title.trim()) {
    showToast('Please enter a task title.', 'error')
    return
  }

  if (!taskForm.subject.trim()) {
    showToast('Please enter a subject.', 'error')
    return
  }

  if (!taskForm.deadline) {
    showToast('Please select a deadline.', 'error')
    return
  }

  const taskData = {
    title: taskForm.title.trim(),
    subject: taskForm.subject.trim(),
    description: taskForm.description.trim(),
    deadline: taskForm.deadline,
    priority: taskForm.priority,
    estimated_time: taskForm.estimatedTime,
  }

  if (editingTask) {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', editingTask.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      showToast('Could not update task.', 'error')
      return
    }

    const updatedTask = {
      id: data.id,
      title: data.title,
      subject: data.subject,
      description: data.description || '',
      deadline: data.deadline,
      priority: data.priority,
      estimatedTime: data.estimated_time || '',
      completed: data.completed,
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === editingTask.id ? updatedTask : task
      )
    )

    showToast('Task updated successfully.')
  } else {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        completed: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
      showToast('Could not add task.', 'error')
      return
    }

    const newTask = {
      id: data.id,
      title: data.title,
      subject: data.subject,
      description: data.description || '',
      deadline: data.deadline,
      priority: data.priority,
      estimatedTime: data.estimated_time || '',
      completed: data.completed,
    }

    setTasks((current) => [...current, newTask])

    showToast('Task added successfully.')
  }

  closeTaskModal()
}


  const toggleTask = async (taskId) => {
  const task = tasks.find((item) => item.id === taskId)

  if (!task) {
    return
  }

  const newCompletedStatus = !task.completed

  const { error } = await supabase
    .from('tasks')
    .update({
      completed: newCompletedStatus,
    })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task completion:', error)
    showToast('Could not update task.', 'error')
    return
  }

  setTasks((current) =>
    current.map((item) =>
      item.id === taskId
        ? {
            ...item,
            completed: newCompletedStatus,
          }
        : item
    )
  )

  showToast(
    newCompletedStatus
      ? 'Task completed! 🎉'
      : 'Task marked as pending.'
  )
}

 const deleteTask = async (taskId) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting task:', error)
    showToast('Could not delete task.', 'error')
    return
  }

  setTasks((current) =>
    current.filter((task) => task.id !== taskId)
  )

  showToast('Task deleted.')
}


  const saveUserName = () => {
    const cleanedName = nameInput.trim()

    if (!cleanedName) {
      showToast('Please enter a name.', 'error')
      return
    }

    setUserName(cleanedName)
    setShowSettings(false)

    showToast('Profile updated successfully.')
  }

    const renderDashboard = () => {
    return (
      <div className="page-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">STUDENT DASHBOARD</p>

            <h1>
              {getGreeting()}, {userName} 👋
            </h1>

            <p className="welcome-text">
              Let's make today productive. Here's what's
              on your plate.
            </p>
          </div>

          <button
            className="add-task-button"
            onClick={openAddTask}
          >
            <Plus size={18} />
            Add Task
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <ListTodo size={21} />
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{tasks.length}</strong>
              <small>
                {pendingTasks.length} pending
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Due Soon</span>
              <strong>{dueSoonTasks.length}</strong>
              <small>Next 7 days</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Completed</span>
              <strong>{progressPercentage}%</strong>
              <small>
                {completedTasks.length} completed
              </small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Sparkles size={21} />
            </div>

            <div>
              <span>Productivity</span>
              <strong>
                {progressPercentage >= 70
                  ? 'Great'
                  : progressPercentage >= 40
                    ? 'Good'
                    : 'Start'}
              </strong>
              <small>Keep going!</small>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="content-panel">
            <div className="section-heading">
              <div>
                <h2>Today's Tasks</h2>
                <p>
                  {todayTasks.length === 0
                    ? 'Nothing pending right now'
                    : `${todayTasks.length} tasks waiting for you`}
                </p>
              </div>

              <button
                className="text-button"
                onClick={() => setActivePage('tasks')}
              >
                View all
                <ArrowRight size={15} />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <CheckCircle2 size={25} />
                </div>

                <h3>You're all caught up!</h3>

                <p>
                  No pending tasks at the moment.
                </p>
              </div>
            ) : (
              <div className="task-list">
                {todayTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={openEditTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="content-panel">
            <div className="section-heading">
              <div>
                <h2>Upcoming</h2>
                <p>Your next deadlines</p>
              </div>

              <CalendarDays size={20} />
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="empty-state compact">
                <div className="empty-icon">
                  <CalendarDays size={22} />
                </div>

                <h3>No upcoming deadlines</h3>

                <p>
                  Add a task with a deadline to see it here.
                </p>
              </div>
            ) : (
              <div className="deadline-list">
                {upcomingTasks.map((task) => {
                  const date = getShortDate(task.deadline)

                  return (
                    <div
                      className="deadline-item"
                      key={task.id}
                    >
                      <div className="date-box">
                        <strong>{date.day}</strong>
                        <span>{date.month}</span>
                      </div>

                      <div className="deadline-info">
                        <strong>{task.title}</strong>
                        <span>{task.subject}</span>
                        <small>
                          {getDateLabel(task.deadline)}
                        </small>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

    const renderTasks = () => {
    return (
      <div className="page-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">ORGANIZE YOUR WORK</p>

            <h1>My Tasks</h1>

            <p>
              Keep track of everything you need to get done.
            </p>
          </div>

          <button
            className="add-task-button"
            onClick={openAddTask}
          >
            <Plus size={18} />
            Add Task
          </button>
        </section>

        <section className="task-toolbar">
          <div className="search-wrapper">
            <Search size={18} />

            <input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search tasks or subjects..."
            />
          </div>

          <div className="filter-wrapper">
            <Filter size={17} />

            <select
              value={taskFilter}
              onChange={(event) =>
                setTaskFilter(event.target.value)
              }
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </section>

        <section className="content-panel task-page-panel">
          <div className="task-page-header">
            <div>
              <h2>{filteredTasks.length} Tasks</h2>

              <p>
                {completedTasks.length} completed ·{' '}
                {pendingTasks.length} pending
              </p>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state large">
              <div className="empty-icon">
                <Search size={28} />
              </div>

              <h3>No tasks found</h3>

              <p>
                Try changing your search or filter.
              </p>

              <button
                className="secondary-button"
                onClick={() => {
                  setSearchQuery('')
                  setTaskFilter('All')
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="full-task-list">
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onEdit={openEditTask}
                  onDelete={deleteTask}
                  detailed
                />
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

    const renderCalendar = () => {
    const selectedTasks = tasks.filter(
      (task) => task.deadline === selectedDate
    )

    const selectedDateObject = new Date(
      `${selectedDate}T00:00:00`
    )

    const formattedSelectedDate =
      selectedDateObject.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

    return (
      <div className="page-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">PLAN AHEAD</p>

            <h1>Calendar</h1>

            <p>
              See your deadlines and plan your workload.
            </p>
          </div>

          <button
            className="add-task-button"
            onClick={openAddTask}
          >
            <Plus size={18} />
            Add Task
          </button>
        </section>

        <section className="calendar-layout">
          <div className="content-panel">
            <div className="calendar-header">
              <button
                className="calendar-nav"
                onClick={() => {
                  const date = new Date(
                    `${selectedDate}T00:00:00`
                  )

                  date.setDate(date.getDate() - 1)

                  setSelectedDate(
                    date.toISOString().split('T')[0]
                  )
                }}
              >
                <ChevronLeft size={19} />
              </button>

              <strong>{formattedSelectedDate}</strong>

              <button
                className="calendar-nav"
                onClick={() => {
                  const date = new Date(
                    `${selectedDate}T00:00:00`
                  )

                  date.setDate(date.getDate() + 1)

                  setSelectedDate(
                    date.toISOString().split('T')[0]
                  )
                }}
              >
                <ChevronRight size={19} />
              </button>
            </div>

            <div className="calendar-date-picker">
              <label>Select date</label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
              />
            </div>

            <div className="selected-date-tasks">
              <h3>
                Tasks for this date
              </h3>

              {selectedTasks.length === 0 ? (
                <div className="empty-state compact">
                  <div className="empty-icon">
                    <CalendarDays size={22} />
                  </div>

                  <p>
                    No tasks are scheduled for this date.
                  </p>
                </div>
              ) : (
                selectedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={openEditTask}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </div>
          </div>

          <div className="content-panel">
            <div className="section-heading">
              <div>
                <h2>All Deadlines</h2>
                <p>Upcoming academic work</p>
              </div>
            </div>

            <div className="deadline-list">
              {upcomingTasks.length === 0 ? (
                <p className="muted-text">
                  No upcoming deadlines.
                </p>
              ) : (
                upcomingTasks.map((task) => {
                  const date = getShortDate(task.deadline)

                  return (
                    <button
                      className="deadline-item clickable"
                      key={task.id}
                      onClick={() =>
                        setSelectedDate(task.deadline)
                      }
                    >
                      <div className="date-box">
                        <strong>{date.day}</strong>
                        <span>{date.month}</span>
                      </div>

                      <div className="deadline-info">
                        <strong>{task.title}</strong>
                        <span>{task.subject}</span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </div>
    )
  }

  const renderPlanner = () => {
    const plannerTasks = [...pendingTasks]
      .sort((a, b) => {
        const priorityOrder = {
          High: 1,
          Medium: 2,
          Low: 3,
        }

        if (
          priorityOrder[a.priority] !==
          priorityOrder[b.priority]
        ) {
          return (
            priorityOrder[a.priority] -
            priorityOrder[b.priority]
          )
        }

        return a.deadline.localeCompare(b.deadline)
      })
      .slice(0, 5)

    return (
      <div className="page-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">WORK SMARTER</p>

            <h1>Smart Planner</h1>

            <p>
              A simple priority-based view of what to focus
              on next.
            </p>
          </div>
        </section>

        <section className="planner-hero">
          <div className="planner-icon">
            <Sparkles size={27} />
          </div>

          <div>
            <h2>Your recommended focus list</h2>

            <p>
              Start with high-priority work and tasks with
              the nearest deadlines.
            </p>
          </div>
        </section>

        <section className="content-panel">
          <div className="section-heading">
            <div>
              <h2>Focus Queue</h2>
              <p>
                {plannerTasks.length} tasks to consider
              </p>
            </div>
          </div>

          {plannerTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <CheckCircle2 size={25} />
              </div>

              <h3>Everything is under control!</h3>

              <p>
                Complete a task or add something new when
                you're ready.
              </p>
            </div>
          ) : (
            <div className="planner-list">
              {plannerTasks.map((task, index) => (
                <div
                  className="planner-item"
                  key={task.id}
                >
                  <div className="planner-number">
                    {index + 1}
                  </div>

                  <div className="planner-task">
                    <div className="planner-task-title">
                      <strong>{task.title}</strong>

                      <span
                        className="priority-badge"
                        style={{
                          color:
                            priorityConfig[task.priority]
                              .color,
                          backgroundColor:
                            priorityConfig[task.priority]
                              .background,
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <span>{task.subject}</span>

                    <small>
                      {getDateLabel(task.deadline)}
                      {task.estimatedTime
                        ? ` · ${task.estimatedTime}`
                        : ''}
                    </small>
                  </div>

                  <button
                    className="icon-action"
                    onClick={() => openEditTask(task)}
                    title="Edit task"
                  >
                    <Edit3 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }


    const renderCurrentPage = () => {
    if (activePage === 'tasks') {
      return renderTasks()
    }

    if (activePage === 'calendar') {
      return renderCalendar()
    }

    if (activePage === 'planner') {
      return renderPlanner()
    }

    return renderDashboard()
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>

          <div>
            <h2>StudentFlow</h2>
            <span>Study smarter</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  activePage === item.id ? 'active' : ''
                }`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => {
              setNameInput(userName)
              setShowSettings(true)
            }}
          >
            <Settings size={19} />

            <span>Settings</span>
          </button>

          <div className="team-badge">
            <span>Hackathon Team</span>
            <strong>Keyboard Warriers</strong>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="header">
          <div className="header-search">
            <Search size={18} />

            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)

                if (
                  activePage !== 'tasks' &&
                  event.target.value
                ) {
                  setActivePage('tasks')
                }
              }}
              placeholder="Search tasks..."
            />
          </div>

          <div className="header-actions">
            <div className="notification-wrapper">
              <button
                className="icon-button"
                onClick={() =>
                  setShowNotifications(
                    !showNotifications
                  )
                }
              >
                <Bell size={19} />

                {dueSoonTasks.length > 0 && (
                  <span className="notification-dot" />
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-header">
                    <strong>Notifications</strong>

                    <button
                      onClick={() =>
                        setShowNotifications(false)
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {dueSoonTasks.length === 0 ? (
                    <div className="notification-empty">
                      <CheckCircle2 size={22} />

                      <p>
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {dueSoonTasks
                        .slice(0, 3)
                        .map((task) => (
                          <div
                            className="notification-item"
                            key={task.id}
                          >
                            <AlertCircle
                              size={18}
                            />

                            <div>
                              <strong>
                                {task.title}
                              </strong>

                              <span>
                                {getDateLabel(
                                  task.deadline
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="profile"
              onClick={() => {
                setNameInput(userName)
                setShowSettings(true)
              }}
            >
              <div className="avatar">
                {userName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="profile-info">
                <strong>{userName}</strong>
                <span>Student</span>
              </div>
            </button>
          </div>
        </header>

        <main>{renderCurrentPage()}</main>
      </div>

      {showTaskModal && (
        <div
          className="modal-overlay"
          onMouseDown={closeTaskModal}
        >
          <div
            className="modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingTask
                    ? 'UPDATE TASK'
                    : 'NEW TASK'}
                </p>

                <h2>
                  {editingTask
                    ? 'Edit Task'
                    : 'Add a New Task'}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={closeTaskModal}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveTask}>
              <div className="form-group">
                <label>Task title *</label>

                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(event) =>
                    handleTaskFormChange(
                      'title',
                      event.target.value
                    )
                  }
                  placeholder="e.g. Complete DBMS project"
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>

                  <input
                    type="text"
                    value={taskForm.subject}
                    onChange={(event) =>
                      handleTaskFormChange(
                        'subject',
                        event.target.value
                      )
                    }
                    placeholder="e.g. DBMS"
                  />
                </div>

                <div className="form-group">
                  <label>Deadline *</label>

                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(event) =>
                      handleTaskFormChange(
                        'deadline',
                        event.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>

                  <select
                    value={taskForm.priority}
                    onChange={(event) =>
                      handleTaskFormChange(
                        'priority',
                        event.target.value
                      )
                    }
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated time</label>

                  <input
                    type="text"
                    value={taskForm.estimatedTime}
                    onChange={(event) =>
                      handleTaskFormChange(
                        'estimatedTime',
                        event.target.value
                      )
                    }
                    placeholder="e.g. 2 hours"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  rows="4"
                  value={taskForm.description}
                  onChange={(event) =>
                    handleTaskFormChange(
                      'description',
                      event.target.value
                    )
                  }
                  placeholder="Add some details about this task..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeTaskModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingTask
                    ? 'Save Changes'
                    : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettings && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setShowSettings(false)
          }
        >
          <div
            className="modal settings-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">PROFILE</p>

                <h2>Settings</h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowSettings(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="profile-preview">
              <div className="large-avatar">
                {nameInput
                  .charAt(0)
                  .toUpperCase() || 'S'}
              </div>

              <div>
                <strong>
                  {nameInput || 'Student'}
                </strong>

                <span>Student account</span>
              </div>
            </div>

            <div className="form-group">
              <label>Your name</label>

              <input
                type="text"
                value={nameInput}
                onChange={(event) =>
                  setNameInput(event.target.value)
                }
                placeholder="Enter your name"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    saveUserName()
                  }
                }}
              />
            </div>

            <p className="settings-note">
              Your name is stored only in this browser
              and is used to personalize your dashboard.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setShowSettings(false)
                }
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveUserName}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`toast ${
            toast.type === 'error' ? 'error' : ''
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}

          <span>{toast.message}</span>

          <button onClick={() => setToast(null)}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
  detailed = false,
}) {
  const priority = priorityConfig[task.priority]

  return (
    <div
      className={`task-row ${
        task.completed ? 'completed' : ''
      } ${detailed ? 'detailed' : ''}`}
    >
      <button
        className={`task-check ${
          task.completed ? 'checked' : ''
        }`}
        onClick={() => onToggle(task.id)}
        title={
          task.completed
            ? 'Mark as pending'
            : 'Mark as complete'
        }
      >
        {task.completed ? (
          <Check size={15} />
        ) : (
          <Circle size={20} />
        )}
      </button>

      <div className="task-color-line">
        <span
          style={{
            backgroundColor: priority.color,
          }}
        />
      </div>

      <div className="task-row-content">
        <div className="task-row-top">
          <div className="task-title-area">
            <h3>{task.title}</h3>

            <span
              className="priority-badge"
              style={{
                color: priority.color,
                backgroundColor: priority.background,
              }}
            >
              {task.priority}
            </span>
          </div>

          <div className="task-actions">
            <button
              className="icon-action"
              onClick={() => onEdit(task)}
              title="Edit task"
            >
              <Edit3 size={16} />
            </button>

            <button
              className="icon-action danger"
              onClick={() => onDelete(task.id)}
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <p className="task-subject">
          {task.subject}
        </p>

        {detailed && task.description && (
          <p className="task-description">
            {task.description}
          </p>
        )}

        <div className="task-meta">
          {task.deadline && (
            <span>
              <CalendarDays size={14} />
              {formatDate(task.deadline)}
            </span>
          )}

          {task.estimatedTime && (
            <span>
              <Clock3 size={14} />
              {task.estimatedTime}
            </span>
          )}

          {task.deadline && (
            <span
              className={
                getDaysUntil(task.deadline) < 0 &&
                !task.completed
                  ? 'overdue'
                  : ''
              }
            >
              {getDateLabel(task.deadline)}
            </span>
          )}
        </div>
      </div>

      {!detailed && (
        <button
          className="task-more"
          onClick={() => onEdit(task)}
          title="Manage task"
        >
          <MoreHorizontal size={18} />
        </button>
      )}
    </div>
  )
}

export default App
