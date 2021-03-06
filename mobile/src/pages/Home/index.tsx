import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import React, { useEffect, useState, FunctionComponent } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import axios from 'axios';

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

import { Location } from '../../store/ducks/location/types';
import * as LocationActions from '../../store/ducks/location/actions';
import { AplicationState } from '../../store';

//Mapeia o que vem no state
interface StateProps {
  location: Location;
}

// Mapei as funções que podem ser utilizadas
interface DispatchProps {
  setLocationRequest(data: Location): void;
}

// Qualquer propriedade que vier de um componente pai
interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

const Home: FunctionComponent<Props> = (props) => {
  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const navigation = useNavigation();

  function handleNavigateToPoints() {
    const { setLocationRequest } = props;

    setLocationRequest({ uf: selectedUf, city: selectedCity });

    navigation.navigate('Points');
  }

  const placeholder = [
    {
      label: 'Selecione uma UF',
      value: null,
      color: '#9EA0A4'
    },
    {
      label: 'Selecione uma Cidade',
      value: null,
      color: '#9EA0A4'
    }
  ];

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then((response) => {
        const UfInitials = response.data.map((uf) => uf.sigla);
        setUfs(UfInitials);
      });
  }, []);

  useEffect(() => {
    //Carregar as cidades sempre que a UF mudar
    if (selectedUf === '') {
      return;
    }
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const CityNames = response.data.map((city) => city.nome);
        setCities(CityNames);
      });
  }, [selectedUf]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.main}>
          <View>
            <Text style={styles.title}>
              Seu companheiro em uma vida saudável
            </Text>
            <Text style={styles.description}>
              Ajudamos pessoas a encontrarem locais esportivos e a organizarem
              suas rotinas
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <RNPickerSelect
            placeholder={placeholder[0]}
            onValueChange={(value) => setSelectedUf(value)}
            items={ufs.map((uf) => ({
              key: uf,
              label: uf,
              value: uf
            }))}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
          />
          <RNPickerSelect
            placeholder={placeholder[1]}
            onValueChange={(value) => setSelectedCity(value)}
            items={cities.map((city) => ({
              key: city,
              label: city,
              value: city
            }))}
            useNativeAndroidPickerStyle={false}
            style={pickerSelectStyles}
          />
          <RectButton
            style={[
              styles.button,
              (selectedUf == '' || selectedCity == '') && styles.disabledButton
            ]}
            onPress={handleNavigateToPoints}
          >
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#fff" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>Entrar</Text>
          </RectButton>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const mapStateToProps = (state: AplicationState) => ({
  location: state.location.data
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(LocationActions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32
  },

  main: {
    flex: 1,
    justifyContent: 'center'
  },

  title: {
    color: '#322153',
    fontSize: 30,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24
  },

  footer: {},

  select: {},

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16
  },

  disabledButton: {
    opacity: 0.5
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    color: 'black'
  }
});
