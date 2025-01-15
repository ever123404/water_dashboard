import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Droplet, Award, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

const metodos = ['Ósmosis inversa', 'Ionización', 'Cloración', 'Radiación ultravioleta'];
const Dashboard = () => {
    const [inputData, setInputData] = useState({
      dureza: 250,
      ph: 6.8,
      turbidez: 5,
      metalesPesados: 0.05,
      microorganismos: 100
    });
  
    const [resultados, setResultados] = useState([]);
    const [mejorMetodo, setMejorMetodo] = useState('');
    const [historialDatos, setHistorialDatos] = useState([]);
    const [historialRecomendaciones, setHistorialRecomendaciones] = useState([]);
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
    const [tiempoUltimaRecomendacion, setTiempoUltimaRecomendacion] = useState(0);
  
    const generarDatosAleatorios = () => ({
      dureza: Math.random() * 300 + 100,
      ph: Math.random() * 3 + 5.5,
      turbidez: Math.random() * 10,
      metalesPesados: Math.random() * 0.1,
      microorganismos: Math.random() * 200
    });
  
    const evaluarMetodos = (data) => {
      const eficaciaBase = [95, 88, 85, 90];
      const eficienciaBase = [70, 80, 90, 85];
      const viabilidadBase = [75, 85, 95, 90];
      const nuevosResultados = metodos.map((metodo, index) => {
        let eficacia = eficaciaBase[index];
        let eficiencia = eficienciaBase[index];
        let viabilidad = viabilidadBase[index];
  
        if (metodo === 'Ósmosis inversa') {
          eficacia += Math.min(20, data.metalesPesados * 200);
          eficiencia -= Math.min(20, data.dureza / 10);
        } else if (metodo === 'Ionización') {
          eficacia += Math.min(15, data.dureza / 15);
          eficiencia -= Math.min(10, data.metalesPesados * 100);
        } else if (metodo === 'Cloración') {
          eficacia += Math.min(20, data.microorganismos / 5);
          eficacia -= Math.min(15, data.metalesPesados * 150);
        } else if (metodo === 'Radiación ultravioleta') {
          eficacia += Math.min(20, data.microorganismos / 5);
          eficacia -= Math.min(15, data.turbidez * 2);
        }
  
        const pHOptimo = 7;
        const ajustePH = 10 - Math.abs(data.ph - pHOptimo) * 2;
        eficacia += ajustePH;
        eficiencia += ajustePH;
  
        eficacia = Math.max(0, Math.min(100, eficacia));
        eficiencia = Math.max(0, Math.min(100, eficiencia));
        viabilidad = Math.max(0, Math.min(100, viabilidad));
  
        const puntuacion = (eficacia * 0.4 + eficiencia * 0.3 + viabilidad * 0.3).toFixed(2);
  
        return {
          nombre: metodo,
          eficacia,
          eficiencia,
          viabilidad,
          puntuacion
        };
      });
      setResultados(nuevosResultados);
    const nuevoMejorMetodo = nuevosResultados.reduce((prev, current) => 
      (parseFloat(prev.puntuacion) > parseFloat(current.puntuacion)) ? prev : current
    );
    
    if (nuevoMejorMetodo.nombre !== mejorMetodo) {
      setMejorMetodo(nuevoMejorMetodo.nombre);
      setTiempoUltimaRecomendacion(tiempoTranscurrido);
    }
    
    return nuevoMejorMetodo.nombre;
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (tiempoTranscurrido < 600) { // 10 minutos = 600 segundos
        const nuevosDatos = generarDatosAleatorios();
        setInputData(nuevosDatos);
        const nuevoMejorMetodo = evaluarMetodos(nuevosDatos);
        setHistorialDatos(prev => [...prev, { ...nuevosDatos, tiempo: tiempoTranscurrido }]);
        setHistorialRecomendaciones(prev => [...prev, { metodo: nuevoMejorMetodo, tiempo: tiempoTranscurrido }]);
        setTiempoTranscurrido(prev => prev + 5);
      } else {
        clearInterval(intervalo);
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, [tiempoTranscurrido, mejorMetodo]);

  const formatTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  };
  return (
    <div className="p-4 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Tratamiento de Agua - UNC</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {Object.entries(inputData).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {key === 'dureza' ? 'mg/L CaCO3' : 
                 key === 'ph' ? '' :
                 key === 'turbidez' ? 'NTU' :
                 key === 'metalesPesados' ? 'mg/L' :
                 key === 'microorganismos' ? 'UFC/100mL' : ''}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Resultados de la Evaluación</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resultados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="eficacia" fill="#8884d8" name="Eficacia" />
              <Bar dataKey="eficiencia" fill="#82ca9d" name="Eficiencia" />
              <Bar dataKey="viabilidad" fill="#ffc658" name="Viabilidad" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Historial de Parámetros</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historialDatos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tiempo" label={{ value: 'Tiempo (s)', position: 'insideBottomRight', offset: -10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="dureza" stroke="#8884d8" name="Dureza" />
              <Line type="monotone" dataKey="ph" stroke="#82ca9d" name="pH" />
              <Line type="monotone" dataKey="turbidez" stroke="#ffc658" name="Turbidez" />
              <Line type="monotone" dataKey="metalesPesados" stroke="#ff8042" name="Metales Pesados" />
              <Line type="monotone" dataKey="microorganismos" stroke="#00C49F" name="Microorganismos" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Historial de Recomendaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historialRecomendaciones}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tiempo" label={{ value: 'Tiempo (s)', position: 'insideBottomRight', offset: -10 }} />
              <YAxis dataKey="metodo" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="metodo" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Alert>
        <Award className="h-4 w-4" />
        <AlertTitle>Método Recomendado Actual</AlertTitle>
        <AlertDescription>
          El método recomendado para la Universidad Nacional de Cajamarca es <strong>{mejorMetodo}</strong>.
          <br />
          Rango de tiempo: {formatTiempo(tiempoUltimaRecomendacion)} - {formatTiempo(tiempoTranscurrido)}
        </AlertDescription>
      </Alert>

      <div className="mt-4 text-center">
        Tiempo transcurrido: {formatTiempo(tiempoTranscurrido)}
      </div>
    </div>
  );
};

export default Dashboard;