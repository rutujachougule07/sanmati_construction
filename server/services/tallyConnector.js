// SANMATI CONSTRUCTIONS ERP - Tally Local Connector Engine
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TALLY_HOST = process.env.TALLY_HOST || 'http://localhost';
const TALLY_PORT = process.env.TALLY_PORT || 9000;
const TALLY_URL = `${TALLY_HOST}:${TALLY_PORT}`;

export const tallyConnector = {
  /**
   * Check connection status with local Tally instance
   */
  async pingTally() {
    try {
      const response = await axios.post(TALLY_URL, '', {
        headers: { 'Content-Type': 'text/xml' },
        timeout: 3000
      });
      return {
        online: true,
        statusCode: response.status,
        message: 'Tally ODBC XML Server is active and responding.'
      };
    } catch (err) {
      return {
        online: false,
        host: TALLY_URL,
        message: `Tally instance not reachable at ${TALLY_URL} (${err.code || err.message}). Ready to dispatch as soon as Tally is launched.`
      };
    }
  },

  /**
   * Post XML voucher payload to Tally
   */
  async postXML(xmlData) {
    try {
      const response = await axios.post(TALLY_URL, xmlData, {
        headers: { 'Content-Type': 'text/xml;charset=utf-8' },
        timeout: 5000
      });
      return {
        success: true,
        data: response.data,
        status: 'Synced'
      };
    } catch (err) {
      console.warn(`[Tally Connector] Direct post to ${TALLY_URL} unsuccessful:`, err.message);
      return {
        success: false,
        error: err.message,
        code: err.code,
        message: `XML payload created successfully. Ensure Tally XML Server is running on port ${TALLY_PORT}.`,
        xmlPreview: xmlData
      };
    }
  }
};
