import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch, getAuthToken, setAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState([])
  const [currentWorkspace, setCurrentWorkspace] = useState(null)
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      setLoading(true)
      const userData = await apiFetch('/auth/me')
      setUser(userData)
      await loadWorkspaces()
    } catch (err) {
      console.error('Failed to load user:', err)
      setAuthToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadWorkspaces = async () => {
    try {
      const wsData = await apiFetch('/workspaces/')
      setWorkspaces(wsData)
      if (wsData.length > 0) {
        const activeWs = wsData[0]
        setCurrentWorkspace(activeWs)
        await loadProjects(activeWs.id)
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err)
    }
  }

  const loadProjects = async (workspaceId) => {
    try {
      const projData = await apiFetch(`/projects/?workspace_id=${workspaceId}`)
      setProjects(projData)
      if (projData.length > 0) {
        setCurrentProject(projData[0])
      } else {
        setCurrentProject(null)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setAuthToken(data.access_token)
    setUser(data.user)
    await loadWorkspaces()
    return data
  }

  const signup = async (email, full_name, password) => {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, full_name, password }),
    })
    setAuthToken(data.access_token)
    setUser(data.user)
    // Auto-create a default workspace for new user
    try {
      const ws = await apiFetch('/workspaces/', {
        method: 'POST',
        body: JSON.stringify({
          name: `${full_name}'s Workspace`,
          slug: `workspace-${Date.now()}`,
        }),
      })
      // Auto-create default project
      const proj = await apiFetch('/projects/', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Main Product',
          key: 'TRK',
          workspace_id: ws.id,
        }),
      })
      await loadWorkspaces()
    } catch (e) {
      console.error('Error seeding initial workspace:', e)
    }
    return data
  }

  const logout = () => {
    setAuthToken(null)
    setUser(null)
    setWorkspaces([])
    setCurrentWorkspace(null)
    setProjects([])
    setCurrentProject(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        projects,
        currentProject,
        setCurrentProject,
        loadProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
