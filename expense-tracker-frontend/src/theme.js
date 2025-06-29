import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'SF Pro Display', 'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif",
    body: "'SF Pro Display', 'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif",
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1976d2',
      700: '#1565c0',
      800: '#0d47a1',
      900: '#0a3d62',
    },
    success: {
      500: '#4caf50',
    },
    warning: {
      500: '#ff9800',
    },
    error: {
      500: '#f44336',
    }
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800',
      },
    }),
  },
  components: {
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          shadow: props.colorMode === 'dark' ? 'dark-lg' : 'md',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
        }
      })
    },
    Button: {
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'blue.500' : 'blue.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'blue.400' : 'blue.600',
          }
        }),
        ghost: (props) => ({
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
          }
        })
      }
    },
    Input: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
            },
            _focus: {
              borderColor: 'blue.500',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? '#3182ce' : '#3182ce'}`,
            }
          }
        })
      }
    },
    Select: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
            }
          }
        })
      }
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        },
        overlay: {
          bg: props.colorMode === 'dark' ? 'blackAlpha.600' : 'blackAlpha.600',
        }
      })
    },
    Menu: {
      baseStyle: (props) => ({
        list: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
        },
        item: {
          bg: 'transparent',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
          }
        }
      })
    }
  }
})

export default theme
